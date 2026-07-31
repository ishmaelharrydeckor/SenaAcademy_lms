import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { url, title, transcript } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url string is required' }, { status: 400 });
    }

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'transcript string is required' }, { status: 400 });
    }

    // 1. Read the video hooks framework
    const rulebookPath = path.join(process.cwd(), 'src/lib/agents/knowledge/video_hooks_framework.md');
    const rulebook = await fs.readFile(rulebookPath, 'utf-8');

    // 2. Build the analysis prompt for Gemini
    const prompt = `
You are the Creative Research Agent for Sena Academy. Your job is to analyze this viral video transcript and break down its retention mechanisms and storytelling psychology.

Use the following stickiness and hooks framework to guide your analysis:
---
${rulebook}
---

Video Details:
URL: ${url}
Title: ${title || 'Untitled Viral Video'}
Transcript:
"""
${transcript}
"""

Instructions:
Deconstruct this video into a structured breakdown. Be specific, concrete, and clear.
Respond ONLY with a JSON object in this format:
{
  "hook": "Analysis of the first 3 seconds hook and why it worked",
  "pattern_interrupts": "Transitions, edits, or auditory/visual pattern interrupts used",
  "story_structure": "Step-by-step narrative flow (how the story moves from start to end)",
  "psychological_triggers": "Key emotional drivers used (fears, desires, social proof)",
  "cta": "The call-to-action and how it is framed",
  "retention_mechanisms": "How the video maintains viewer attention through the middle",
  "sena_adaptation": "A detailed, concrete concept showing how Sena Academy can adapt this exact format. Include a sample Hook sentence and the core lesson to teach."
}
`;

    // 3. Request analysis from Gemini
    const analysis = await callGemini(prompt, true);

    // 4. Save to the Supabase database
    const { data: researchRecord, error: dbError } = await supabase
      .from('marketing_tiktok_research')
      .upsert({
        url,
        title: title || 'Untitled Viral Video',
        transcript,
        analysis,
        status: 'analyzed'
      }, { onConflict: 'url' })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to save creative research:', dbError);
      return NextResponse.json({ error: 'Failed to write research record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: researchRecord
    });

  } catch (error: any) {
    console.error('Creative research route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
