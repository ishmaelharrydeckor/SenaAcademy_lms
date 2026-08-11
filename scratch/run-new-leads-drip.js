const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const brevoApiKey = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

const kvUrl = envContent.match(/harry_KV_REST_API_URL\s*=\s*(.*)/)?.[1].trim().replace(/^['"]|['"]$/g, '');
const kvToken = envContent.match(/harry_KV_REST_API_TOKEN\s*=\s*(.*)/)?.[1].trim().replace(/^['"]|['"]$/g, '');

const client = createClient(url, key);
const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';
const guideLink = 'https://senaacademy.org/guide';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEmailTemplate(stepId, recipientName) {
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

  if (stepId === 'email_b') {
    subject = 'How non-coders in Ghana are building software in 48 hours 🇬🇭';
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        A few days ago, you grabbed our <strong>Non-Coder Guide to AI</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Today, I want to show you what is actually possible when you stop trying to memorize traditional computer code and start using <strong>plain English prompt architecture</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Last month, when the organizers of the <strong>M.M.M 1.0 Conference at KNUST</strong> needed a digital registration and attendee check-in system for hundreds of attendees, traditional software agencies quoted weeks of development.
      </p>
      <div style="background-color: #F3F4F6; border-left: 4px solid #4F46E5; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937; line-height: 1.5;">
          Using modern AI builder tools, I built and shipped the entire live platform in 48 hours.
        </p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        On event day, the check-in flow was completely seamless, and between July 29th and August 2nd, my Paystack dashboard spiked to <strong>GHS 3,650 in a single week</strong>.
      </p>
      <h3 style="color: #111827; font-size: 17px; margin: 20px 0 10px 0;">Why this matters for you:</h3>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        You don’t need a 4-year Computer Science degree. When you open <strong>Google AI Studio</strong> (<code>aistudio.google.com</code>) and paste the <em>Universal Idea-to-App Prompt</em> from your free guide, the AI plans and generates your entire visual layout in 60 seconds.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        In our <strong>Free Live Online Workshop in September</strong>, I will open my laptop and show you how to take that prototype and turn it into a real, deployed web app with Mobile Money checkout!
      </p>
    `;
  } else if (stepId === 'email_c') {
    subject = '3 simple tools local businesses desperately need in Accra & Kumasi 💼';
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        A lot of people ask me: <em>"Ishmael, if I learn to build web apps with AI, who will actually pay me in Ghana?"</em>
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Here is the reality of the Ghanaian market right now:
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Thousands of local businesses in Accra, Kumasi, and across Ghana are losing customers every single day because they are managing everything manually on paper notebooks and WhatsApp DMs. They desperately need <strong>3 simple web tools</strong>:
      </p>
      <ol style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li><strong>Appointment Booking Pages:</strong> For hair salons, barbershops, and health clinics so clients can pick a time slot and pay a deposit online.</li>
        <li><strong>Event & Conference Registration Portals:</strong> Like the one I built for KNUST to handle digital ticketing and attendee verification.</li>
        <li><strong>Instant Mobile Money Checkout Forms:</strong> Simple checkout portals that allow customers to buy products directly without back-and-forth WhatsApp chats.</li>
      </ol>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Traditional agencies charge GHS 15,000+ and take 2 months. As a modern AI builder, you can build and deliver these exact tools in <strong>48 hours</strong> and comfortably charge <strong>GHS 1,500 to GHS 5,000 per project</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        In our <strong>Free Live Online Workshop in September</strong>, I will walk you through the exact blueprint to build and monetize these tools from scratch.
      </p>
    `;
  }

  return { subject, html: header + body + footer };
}

async function runNewLeadsDrip() {
  console.log(`\n========================================`);
  console.log(`🤖 RUNNING NEW LEADS ONBOARDING DRIP CHECK`);
  console.log(`========================================\n`);

  // Fetch all new signups from August 1st onwards
  const { data: newLeads, error } = await client
    .from('event_waitlist')
    .select('id, full_name, email, created_at')
    .gte('created_at', '2026-08-01T00:00:00Z')
    .order('created_at', { ascending: true });

  if (error || !newLeads) {
    console.error('Error fetching new leads:', error?.message);
    return;
  }

  console.log(`Found ${newLeads.length} new August signups.`);
  const now = new Date();

  for (const lead of newLeads) {
    const createdAt = new Date(lead.created_at);
    const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    const cleanEmail = lead.email.toLowerCase().trim();

    // Check Day 3 Drip (Email B)
    if (ageDays >= 3) {
      const tagB = `drip_sent:email_b:${cleanEmail}`;
      let hasSentB = false;

      if (kvUrl && kvToken) {
        try {
          const res = await fetch(`${kvUrl}/get/${tagB}`, { headers: { Authorization: `Bearer ${kvToken}` } });
          hasSentB = !!(await res.json())?.result;
        } catch (e) {}
      }

      if (!hasSentB) {
        console.log(`📬 Sending Email B (Day 3) to ${cleanEmail} (Age: ${ageDays.toFixed(1)} days)...`);
        const { subject, html } = getEmailTemplate('email_b', lead.full_name);
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'api-key': brevoApiKey, 'content-type': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'Sena Academy', email: 'support@senaacademy.org' },
              to: [{ email: cleanEmail, name: lead.full_name }],
              subject: subject,
              htmlContent: html,
            }),
          });

          if (kvUrl && kvToken) {
            await fetch(`${kvUrl}/set/${tagB}/1`, { method: 'POST', headers: { Authorization: `Bearer ${kvToken}` } });
          }
          console.log(`✅ Sent Email B to ${cleanEmail}`);
        } catch (err) {
          console.error(`Failed Email B for ${cleanEmail}:`, err);
        }
      }
    }

    // Check Day 6 Drip (Email C)
    if (ageDays >= 6) {
      const tagC = `drip_sent:email_c:${cleanEmail}`;
      let hasSentC = false;

      if (kvUrl && kvToken) {
        try {
          const res = await fetch(`${kvUrl}/get/${tagC}`, { headers: { Authorization: `Bearer ${kvToken}` } });
          hasSentC = !!(await res.json())?.result;
        } catch (e) {}
      }

      if (!hasSentC) {
        console.log(`📬 Sending Email C (Day 6) to ${cleanEmail} (Age: ${ageDays.toFixed(1)} days)...`);
        const { subject, html } = getEmailTemplate('email_c', lead.full_name);
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'api-key': brevoApiKey, 'content-type': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'Sena Academy', email: 'support@senaacademy.org' },
              to: [{ email: cleanEmail, name: lead.full_name }],
              subject: subject,
              htmlContent: html,
            }),
          });

          if (kvUrl && kvToken) {
            await fetch(`${kvUrl}/set/${tagC}/1`, { method: 'POST', headers: { Authorization: `Bearer ${kvToken}` } });
          }
          console.log(`✅ Sent Email C to ${cleanEmail}`);
        } catch (err) {
          console.error(`Failed Email C for ${cleanEmail}:`, err);
        }
      }
    }
  }
}

module.exports = { runNewLeadsDrip };

if (require.main === module) {
  runNewLeadsDrip();
}
