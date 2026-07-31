import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { chatLog } = await req.json();

    if (!chatLog || typeof chatLog !== 'string') {
      return NextResponse.json({ error: 'chatLog string is required' }, { status: 400 });
    }

    // 1. Read the objections framework rulebook
    const rulebookPath = path.join(process.cwd(), 'src/lib/agents/knowledge/objections_framework.md');
    const rulebook = await fs.readFile(rulebookPath, 'utf-8');

    // 2. Fetch existing objections from Supabase to avoid duplicates and perform grouping
    const { data: existingObjections, error: fetchError } = await supabase
      .from('marketing_objections')
      .select('id, objection_text, category, frequency_count')
      .eq('resolved', false);

    if (fetchError) {
      console.error('Error fetching objections:', fetchError);
    }

    // 3. Construct the prompt for Gemini
    const prompt = `
You are the Community Agent for Sena Academy. Your job is to analyze WhatsApp chat logs or emails to extract customer doubts, objections, or concerns about enrolling in our coding program.

Use the following objection-handling rules to analyze the log:
---
${rulebook}
---

Existing Objections currently in the system:
${JSON.stringify(existingObjections || [], null, 2)}

Chat Transcript to Analyze:
"""
${chatLog}
"""

Instructions:
1. Parse the transcript and find all distinct student objections.
2. For each objection found, check if it closely matches one of the "Existing Objections".
   - If it matches an existing objection, output its "id" and specify that we should INCREMENT its frequency.
   - If it does NOT match any existing objection, output a new objection object containing "objection_text", a "category" ('price', 'time', 'laptop', 'fear', or 'other'), and "source_context" (the exact sentence or message from the chat log).
3. Respond ONLY with a JSON object in this format:
{
  "actions": [
    { "type": "increment", "id": "uuid-of-existing-objection" },
    { "type": "create", "objection_text": "Brief summary", "category": "laptop", "source_context": "..." }
  ]
}
`;

    // 4. Run Gemini API
    const analysis = await callGemini(prompt, true);

    const actions = analysis.actions || [];
    const createdObjections = [];

    // 5. Execute actions in database
    for (const action of actions) {
      if (action.type === 'increment' && action.id) {
        // Find existing to increment
        const existing = existingObjections?.find(o => o.id === action.id);
        if (existing) {
          const { error: updateError } = await supabase
            .from('marketing_objections')
            .update({ frequency_count: existing.frequency_count + 1 })
            .eq('id', action.id);
          
          if (updateError) {
            console.error(`Failed to increment objection ${action.id}:`, updateError);
          }
        }
      } else if (action.type === 'create') {
        const { data: newObjection, error: insertError } = await supabase
          .from('marketing_objections')
          .insert({
            objection_text: action.objection_text,
            category: action.category || 'other',
            source_context: action.source_context,
            frequency_count: 1,
            resolved: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to create new objection:', insertError);
        } else if (newObjection) {
          createdObjections.push(newObjection);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed_actions: actions.length,
      new_objections: createdObjections
    });

  } catch (error: any) {
    console.error('Objections route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
