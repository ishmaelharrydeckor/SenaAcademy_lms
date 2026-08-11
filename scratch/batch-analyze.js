const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env.local variables
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const firstEq = line.indexOf('=');
    const key = line.substring(0, firstEq).trim();
    const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
    process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key to bypass RLS policies during batch insertion
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error('Error: Missing environment keys in .env.local (Supabase URL, Service Role Key, or Gemini API Key).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Load the hooks framework rulebook
const rulebookPath = path.join(__dirname, '../src/lib/agents/knowledge/video_hooks_framework.md');
if (!fs.existsSync(rulebookPath)) {
  console.error('Error: Could not find video_hooks_framework.md in src/lib/agents/knowledge/');
  process.exit(1);
}
const rulebook = fs.readFileSync(rulebookPath, 'utf8');

// Gemini calling function (Node-fetch is global in Node 18+)
async function analyzeWithGemini(url, title, transcript) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`;

  const prompt = `
You are the Creative Research Agent for Sena Academy. Your job is to analyze this viral video transcript and break down its retention mechanisms and storytelling psychology.

Use the following stickiness and hooks framework to guide your analysis:
---
${rulebook}
---

Video Details:
URL: ${url}
Title: ${title}
Transcript:
"""
${transcript}
"""

Instructions:
Deconstruct this video into a structured breakdown. Be specific, concrete, and clear.
Respond ONLY with a JSON object in this format (no markdown tags, no backticks, just raw JSON text):
{
  "hook": "Analysis of the first 3 seconds hook and why it worked",
  "pattern_interrupts": "Transitions, edits, or auditory/visual pattern interrupts used",
  "story_structure": "Step-by-step narrative flow",
  "psychological_triggers": "Key emotional drivers used",
  "cta": "The call-to-action and how it is framed",
  "retention_mechanisms": "How the video maintains viewer attention through the middle",
  "sena_adaptation": "A detailed, concrete concept showing how Sena Academy can adapt this exact format. Include a sample Hook sentence and the core lesson to teach."
}
`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API HTTP Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return JSON.parse(text);
}

// 3. Batch processing execution
async function runBatch() {
  const dataPath = path.join(__dirname, 'tiktok_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Error: Please place your scraped TikTok data in scratch/tiktok_data.json');
    console.log('JSON format should be an array of objects: [{ "url": "...", "title": "...", "transcript": "..." }]');
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  let videos = [];
  try {
    videos = JSON.parse(rawData);
  } catch (err) {
    console.error('Error parsing JSON from scratch/tiktok_data.json:', err.message);
    process.exit(1);
  }

  console.log(`Starting batch analysis for ${videos.length} videos...`);

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    
    // Automatically map Apify's standard JSON output fields to our db schema
    const url = video.webVideoUrl || video.url;
    const title = video.title || video.text || 'Untitled Viral Video';
    const transcript = video.transcript || video.text || ''; // Falls back to video caption if transcript is not present

    if (!url || !transcript) {
      console.log(`[Skipping] Video #${i + 1} is missing URL or descriptive text/transcript.`);
      continue;
    }

    console.log(`\n[${i + 1}/${videos.length}] Processing: "${title.substring(0, 40)}..."`);

    try {
      // Analyze with Gemini
      const analysis = await analyzeWithGemini(url, title || 'Untitled', transcript);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('marketing_tiktok_research')
        .upsert({
          url,
          title: title || 'Untitled Viral Video',
          transcript,
          analysis,
          status: 'analyzed'
        }, { onConflict: 'url' });

      if (dbError) {
        console.error(`  - [DB Error] Failed to save video to database: ${dbError.message}`);
      } else {
        console.log(`  - [Success] Analyzed and saved to Supabase.`);
      }

      // Delay to respect API limits (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error(`  - [Failed] Error processing video:`, error);
      // Record failure state in Supabase so you know which ones failed
      try {
        await supabase.from('marketing_tiktok_research').upsert({
          url,
          title: title || 'Untitled Video (Failed)',
          transcript,
          status: 'failed'
        }, { onConflict: 'url' });
      } catch (dbFailErr) {
        // Silently ignore DB errors during failure logging
      }
    }
  }

  console.log('\nBatch processing complete!');
}

runBatch();
