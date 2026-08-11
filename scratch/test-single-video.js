const fs = require('fs');
const path = require('path');

// Parse env keys
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const firstEq = line.indexOf('=');
    const key = line.substring(0, firstEq).trim();
    const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
    process.env[key] = value;
  });
}

const geminiApiKey = process.env.GEMINI_API_KEY;

// Load the hooks framework rulebook
const rulebook = fs.readFileSync(path.join(__dirname, '../src/lib/agents/knowledge/video_hooks_framework.md'), 'utf8');

async function testSingleVideo() {
  const videos = JSON.parse(fs.readFileSync(path.join(__dirname, 'tiktok_data.json'), 'utf8'));
  const video = videos[0];
  
  const url = video.webVideoUrl || video.url;
  const title = video.title || video.text || 'Untitled';
  const transcript = video.transcript || video.text || '';

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

  console.log('Sending request to Gemini...');
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Detailed error stack:');
    console.error(err);
    if (err.cause) {
      console.error('Underlying cause:', err.cause);
    }
  }
}

testSingleVideo();
