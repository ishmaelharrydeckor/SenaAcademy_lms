import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { objectionId, researchId, publishDate } = await req.json();

    if (!objectionId) {
      return NextResponse.json({ error: 'objectionId is required' }, { status: 400 });
    }

    // 1. Fetch Objection details
    const { data: objection, error: objError } = await supabase
      .from('marketing_objections')
      .select('*')
      .eq('id', objectionId)
      .single();

    if (objError || !objection) {
      return NextResponse.json({ error: `Objection not found: ${objError?.message}` }, { status: 404 });
    }

    // 2. Fetch Creative Research framework (Optional)
    let researchData = null;
    if (researchId) {
      const { data: research, error: resError } = await supabase
        .from('marketing_tiktok_research')
        .select('*')
        .eq('id', researchId)
        .single();
      
      if (!resError && research) {
        researchData = research;
      }
    }

    // 3. Read agent rulebooks
    const knowledgeDir = path.join(process.cwd(), 'src/lib/agents/knowledge');
    
    const [objectionsFrame, offersFrame, scriptingTemplates, linkedinFrame] = await Promise.all([
      fs.readFile(path.join(knowledgeDir, 'objections_framework.md'), 'utf-8'),
      fs.readFile(path.join(knowledgeDir, 'hormozi_offers_framework.md'), 'utf-8'),
      fs.readFile(path.join(knowledgeDir, 'vsl_scripting_templates.md'), 'utf-8'),
      fs.readFile(path.join(knowledgeDir, 'linkedin_show_work.md'), 'utf-8'),
    ]);

    // 4. Construct Prompt
    const prompt = `
You are the Lead Creative Director and Copywriter for Sena Academy. Your task is to resolve a specific student objection by writing three marketing assets:
1. A high-retention short-form TikTok video script.
2. A direct-response email newsletter.
3. A build-in-public LinkedIn post.

Target Objection to Resolve:
- Objection: "${objection.objection_text}"
- Category: "${objection.category}"
- Context/Origin: "${objection.source_context || 'None'}"

${researchData ? `
Viral Video Framework to Model:
- Title: "${researchData.title}"
- Viral Hook Style: "${researchData.analysis?.hook || 'N/A'}"
- Adaptation Guidance: "${researchData.analysis?.sena_adaptation || 'N/A'}"
` : ''}

Use the following training rules to guide your copywriting:

---
OBJECTION RESOLUTION RULES:
${objectionsFrame}
---
OFFER VALUE RULES:
${offersFrame}
---
VSL & SCRIPT FORMATTING RULES:
${scriptingTemplates}
---
LINKEDIN AUTHORITY RULES:
${linkedinFrame}
---

Instructions:
1. Write a title for the script.
2. Draft the script hook (under 10 words).
3. The video script MUST be formatted exactly as a Markdown table with columns: Timeline, Visual Direction, Audio Script.
4. The email newsletter must be written in Markdown, structured with direct-response hooks and formatting.
5. The LinkedIn post must follow the LinkedIn Authority layout rules (Hook -> Context -> Struggle/Dip -> Solution -> CTA).
6. Respond ONLY with a JSON object matching this exact schema (do not wrap in markdown code blocks like \`\`\`json, just return raw JSON text):
{
  "title": "Title of the script",
  "hook": "The video hook",
  "framework_used": "e.g., Hormozi VSL / Made to Stick Adaptation",
  "script_body": "The complete video script markdown table text",
  "repurposed_email": "Markdown email content",
  "repurposed_linkedin": "LinkedIn post content"
}
`;

    // 5. Run Gemini
    const result = await callGemini(prompt, true);

    // 6. Save generated Script to Supabase
    const { data: scriptRecord, error: scriptInsertError } = await supabase
      .from('marketing_scripts')
      .insert({
        title: result.title || `Objection Script: ${objection.category}`,
        hook: result.hook || '',
        script_body: result.script_body || '',
        objection_id: objectionId,
        research_id: researchId || null,
        framework_used: result.framework_used || 'Standard Objection handling',
        repurposed_email: result.repurposed_email || '',
        repurposed_linkedin: result.repurposed_linkedin || ''
      })
      .select()
      .single();

    if (scriptInsertError) {
      console.error('Failed to save script to database:', scriptInsertError);
      return NextResponse.json({ error: 'Failed to write script to database' }, { status: 500 });
    }

    // 7. Optionally schedule the script in the Content Planner
    let scheduledPlan = null;
    if (publishDate && scriptRecord) {
      const { data: plan, error: planInsertError } = await supabase
        .from('marketing_content_plan')
        .insert({
          publish_date: publishDate,
          script_id: scriptRecord.id,
          status: 'planned'
        })
        .select()
        .single();
      
      if (!planInsertError) {
        scheduledPlan = plan;
      } else {
        console.error('Failed to schedule script in content plan:', planInsertError);
      }
    }

    return NextResponse.json({
      success: true,
      script: scriptRecord,
      scheduled: scheduledPlan !== null,
      plan: scheduledPlan
    });

  } catch (error: any) {
    console.error('Write-script route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
