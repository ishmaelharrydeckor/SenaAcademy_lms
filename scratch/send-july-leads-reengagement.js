const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const brevoApiKey = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

const client = createClient(url, key);
const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEmailTemplate(recipientName) {
  const firstName = recipientName ? recipientName.split(' ')[0].trim() : 'there';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="margin-bottom: 24px;">
        <h2 style="color: #4F46E5; margin: 0 0 4px 0; font-size: 22px; font-weight: 800;">Sena Academy</h2>
        <p style="color: #6B7280; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Free Live Online Workshop • September 2026</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${firstName}</strong>,</p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        You are receiving this because you signed up for the Sena Academy waitlist.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        We have officially locked in the details for our upcoming **Free Live Build Workshop** in September.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        In this session, we will build a fully functional local business booking website from scratch using AI in under 60 minutes. **No coding experience or computer science background is required.**
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        We've set up a private WhatsApp group where we are sharing the pre-workshop prompt templates, tools, and the live Google Meet link for the event.
      </p>

      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
        <h4 style="color: #166534; margin: 0 0 8px 0; font-size: 17px; font-weight: 700;">👉 Join Our Private Workshop Group</h4>
        <p style="color: #15803D; font-size: 14px; margin: 0 0 18px 0; line-height: 1.5;">
          Secure your spot and get the live access link and free templates:
        </p>
        <a href="${whatsappLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.2);">
          Join WhatsApp Group
        </a>
      </div>

      <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 24px;">
        Or copy and paste this link into your browser: <br/>
        <a href="${whatsappLink}" style="color: #4F46E5;">${whatsappLink}</a>
      </p>

      <p style="font-size: 15px; color: #374151; margin: 0;">
        Best regards,<br/>
        <strong>Ishmael Harry-Deckor</strong><br/>
        Founder, Sena Academy<br/>
        <em style="color: #6B7280; font-size: 13px;">“Stop learning to code. Start learning to build.”</em>
      </p>
    </div>
  `;

  return html;
}

async function sendReengagementCampaign() {
  console.log(`\n========================================`);
  console.log(`🚀 RUNNING JULY LEADS RE-ENGAGEMENT BROADCAST`);
  console.log(`========================================\n`);

  // 1. Fetch only July leads (created before August 1st, 2026)
  const { data: waitlist, error: waitlistErr } = await client
    .from('event_waitlist')
    .select('full_name, email, created_at')
    .lt('created_at', '2026-08-01T00:00:00Z')
    .order('created_at', { ascending: true });

  if (waitlistErr) {
    console.error('Error fetching waitlist:', waitlistErr.message);
    return;
  }

  // 2. Exclude paid Cohort 1 students
  const { data: payments } = await client
    .from('payments')
    .select('email')
    .eq('status', 'success');

  const paidEmails = new Set((payments || []).map(p => p.email.toLowerCase().trim()));
  console.log(`Excluding ${paidEmails.size} paid Cohort 1 students.`);

  // 3. Deduplicate targets
  const targetMap = new Map();
  for (const entry of waitlist) {
    if (!entry.email) continue;
    const cleanEmail = entry.email.toLowerCase().trim();
    if (cleanEmail.includes('test@sena') || cleanEmail.includes('test-live')) continue;
    if (paidEmails.has(cleanEmail)) continue;

    if (!targetMap.has(cleanEmail)) {
      targetMap.set(cleanEmail, entry.full_name || 'Builder');
    }
  }

  const targets = Array.from(targetMap.entries()).map(([email, name]) => ({ email, name }));
  console.log(`🎯 Target Audience: ${targets.length} unique unpaid July waitlist members.\n`);

  if (targets.length === 0) {
    console.log('No targets to send to. Exiting.');
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const html = getEmailTemplate(t.name);
    const subject = 'A second chance to build with AI (Free September Workshop) ⏳';

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Sena Academy', email: 'support@senaacademy.org' },
          to: [{ email: t.email, name: t.name }],
          subject: subject,
          htmlContent: html,
        }),
      });

      if (response.ok) {
        sent++;
        process.stdout.write(`[${i + 1}/${targets.length}] Sent to ${t.email}\r`);
      } else {
        failed++;
        const resData = await response.json();
        console.log(`\nFailed for ${t.email}:`, resData.message || JSON.stringify(resData));
      }
    } catch (err) {
      failed++;
      console.log(`\nError for ${t.email}:`, err.message);
    }

    await sleep(80); // Rate limit throttling
  }

  console.log(`\n\n========================================`);
  console.log(`🎉 BROADCAST COMPLETED!`);
  console.log(`✅ Successfully Delivered: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`========================================\n`);
}

sendReengagementCampaign().catch(err => console.error(err));
