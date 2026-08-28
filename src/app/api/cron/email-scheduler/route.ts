import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const brevoApiKey = process.env.BREVO_API_KEY || '';

const kvUrl = process.env.harry_KV_REST_API_URL || '';
const kvToken = process.env.harry_KV_REST_API_TOKEN || '';

const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';

async function kvGet(key: string) {
  if (!kvUrl || !kvToken) return null;
  try {
    const res = await fetch(`${kvUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: string) {
  if (!kvUrl || !kvToken) return;
  try {
    await fetch(`${kvUrl}/set/${key}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: 'no-store',
    });
  } catch (err) {
    console.error('KV set error:', err);
  }
}

function getEmailTemplate(emailId: string, recipientName: string) {
  const firstName = recipientName ? recipientName.split(' ')[0].trim() : 'there';

  const header = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="margin-bottom: 24px;">
        <h2 style="color: #4F46E5; margin: 0 0 4px 0; font-size: 22px; font-weight: 800;">Sena Academy</h2>
        <p style="color: #6B7280; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Free Live Online Workshop • September 2026</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${firstName}</strong>,</p>
  `;

  const footer = `
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
        <h4 style="color: #166534; margin: 0 0 8px 0; font-size: 17px; font-weight: 700;">👉 Join Our Private WhatsApp Community</h4>
        <p style="color: #15803D; font-size: 14px; margin: 0 0 18px 0; line-height: 1.5;">
          Get the exact September workshop date, live online access link, and free templates:
        </p>
        <a href="${whatsappLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.2);">
          Join WhatsApp Community
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

  let body = '';
  let subject = '';

  if (emailId === 'email_5') {
    subject = 'Date confirmed: Free Live Online Build Workshop 🚀';
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        We have officially locked in the date and time for our upcoming <strong>Free Live Online Build Workshop</strong>!
      </p>
      <div style="background-color: #EEF2FF; border: 1px solid #C7D2FE; padding: 20px; border-radius: 10px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #3730A3;">
          📅 Event Date: Sunday, September 13th, 2026
        </p>
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #3730A3;">
          ⏰ Time: 5:00 PM GMT
        </p>
        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #3730A3;">
          💻 Location: Online (Google Meet link dropped in WhatsApp group)
        </p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        In this 60-minute session, I will open my laptop live on screen and build a complete Ghanaian business website from scratch using plain English AI prompts.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Zero programming background needed. You do not need to install any complex tools before the class.
      </p>
    `;
  }

  return { subject, html: header + body + footer };
}

export async function GET(request: NextRequest) {
  const actions: string[] = [];

  try {
    if (!supabaseUrl || !supabaseServiceKey || !brevoApiKey) {
      return NextResponse.json({ error: 'Missing environment keys' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();

    // Email #5 has already been delivered on August 26. Lock to prevent any re-triggers.
    const isEmail5Sent = true;

    if (!isEmail5Sent) {
      actions.push('Email #5 already sent.');

      // 1. Fetch paid emails to exclude
      const { data: payments } = await supabase.from('payments').select('email').eq('status', 'success');
      const paidEmails = new Set((payments || []).map((p: { email: string }) => p.email.toLowerCase().trim()));

      // 2. Fetch waitlist
      const { data: waitlist } = await supabase
        .from('event_waitlist')
        .select('full_name, email')
        .order('created_at', { ascending: true });

      if (waitlist) {
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
        actions.push(`Targeting ${targets.length} unique unpaid waitlist members.`);

        let sent = 0;
        let failed = 0;

        for (const t of targets) {
          const { subject, html } = getEmailTemplate('email_5', t.name);
          try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                accept: 'application/json',
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

            if (response.ok) sent++;
            else failed++;
          } catch {
            failed++;
          }
        }

        await kvSet(email5SentTag, new Date().toISOString());
        actions.push(`Email #5 Broadcast Finished: ${sent} sent, ${failed} failed.`);
      }
    } else {
      actions.push(`Email #5 status: ${isEmail5Sent ? 'Already Sent' : 'Scheduled for Aug 26 @ 9:00 AM'}`);
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      actions,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Cron Execution Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
