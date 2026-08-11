const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const brevoApiKey = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

const client = createClient(url, key);
const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';
const guideLink = 'https://senaacademy.org/guide';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getEmailTemplate(emailId, recipientName) {
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

  if (emailId === 'email_2') {
    subject = 'The real reason traditional coding tutorials felt impossible... 🧠';
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        If you have ever opened a coding tutorial online, watched someone typing complex computer code, and felt completely overwhelmed after 10 minutes...
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        <strong>I want you to know: it wasn’t your fault.</strong>
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        For years, traditional tech education taught beginners the most frustrating path:
      </p>
      <ul style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li>Memorize hundreds of complicated computer syntax rules.</li>
        <li>Spend weeks fixing tiny typing errors and missing semicolons.</li>
        <li>Build toy projects that no business in Ghana would ever pay for.</li>
      </ul>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        In 2026, that entire model is obsolete.
      </p>
      <div style="background-color: #F3F4F6; border-left: 4px solid #4F46E5; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937; line-height: 1.5;">
          AI now handles 100% of technical computer code in seconds. Your real job in 2026 is simply describing what you want built in plain English.
        </p>
      </div>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        That means whether you are a student, a professional, or someone with zero tech background—you can build and launch real, beautiful web applications in days, not months.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        In September, I'm hosting a <strong>100% free live online workshop</strong> where I will demonstrate how someone with zero coding experience can build and launch a working web app from scratch.
      </p>
    `;
  } else if (emailId === 'email_3') {
    subject = '3 simple web apps Ghanaian businesses will pay GHS 1,500+ for 🇬🇭';
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        A lot of people ask me: <em>"Ishmael, if I build web apps with AI, who is actually going to pay me?"</em>
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Here is the reality of the Ghanaian market right now:
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Thousands of local businesses in Accra, Kumasi, and across Ghana are running their operations on slow, messy paper lists and manual WhatsApp DMs. They desperately need <strong>3 simple web tools</strong>:
      </p>
      <ol style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li><strong>Event Registration Portals:</strong> Like the one I built for the KNUST conference in 48 hours to handle digital attendee check-ins.</li>
        <li><strong>Appointment & Booking Pages:</strong> For local salons, barbershops, and clinics so clients can book appointments online automatically.</li>
        <li><strong>Payment Checkout Portals:</strong> Simple forms that allow customers to pay directly via Mobile Money.</li>
      </ol>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Traditional agencies charge GHS 15,000+ and take months to deliver these. As a modern AI builder, you can build and deliver these exact solutions in <strong>48 to 72 hours</strong> and charge <strong>GHS 1,500 to GHS 5,000 per project</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        During our <strong>free live online workshop in September</strong>, I'll break down the exact client templates and workflows to build these tools from scratch.
      </p>
    `;
  } else if (emailId === 'email_4') {
    subject = "A free gift for you: The Non-Coder's Guide to AI 🎁";
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Today, I have a free actionable gift for you to help you build your first app before our live workshop.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        I just published <strong>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Inside this free guide, you will get:
      </p>
      <ul style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li><strong>The C.G.C. Formula:</strong> How to get clear, high-quality answers from AI without generic corporate jargon.</li>
        <li><strong>The Reverse Interview Method:</strong> How to make AI interview you step-by-step to plan any project.</li>
        <li><strong>The Universal Idea-to-App Blueprint:</strong> The exact fill-in-the-blank prompt to turn any business idea into an interactive visual layout using Google AI Studio.</li>
      </ul>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #1E293B;">Read online or download the free PDF guide:</p>
        <a href="${guideLink}" style="background-color: #4F46E5; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 14px; display: inline-block;">
          👉 Read & Download Free AI Guide
        </a>
      </div>
      <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 20px;">
        Direct link: <a href="${guideLink}" style="color: #4F46E5;">${guideLink}</a>
      </p>
    `;
  } else if (emailId === 'email_5') {
    subject = "Date confirmed: Free Live Online Build Workshop 🚀";
    body = `
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        The date is officially locked!
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        In our upcoming <strong>free live online workshop</strong>, we are going to open our laptops together and build a complete, functional web application live on screen from scratch.
      </p>
      <ul style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li>How to go from idea to working live website in 30 minutes using plain English prompts.</li>
        <li>How to connect instant user logins and databases without writing backend code.</li>
        <li>How to deploy your live website to a real public link for free with one click.</li>
      </ul>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        We will be dropping the direct online meeting room link inside our private WhatsApp community 15 minutes before we go live.
      </p>
    `;
  }

  return { subject, html: header + body + footer };
}

async function runCampaign(emailId) {
  if (!emailId || !['email_2', 'email_3', 'email_4', 'email_5'].includes(emailId)) {
    console.error('Please specify a valid emailId: email_2, email_3, email_4, or email_5');
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`🚀 RUNNING BROADCAST: [${emailId.toUpperCase()}]`);
  console.log(`========================================\n`);

  // 1. Exclude paid Cohort 1 students
  const { data: payments } = await client
    .from('payments')
    .select('email')
    .eq('status', 'success');

  const paidEmails = new Set((payments || []).map(p => p.email.toLowerCase().trim()));
  console.log(`Excluding ${paidEmails.size} paid Cohort 1 students.`);

  // 2. Fetch waitlist
  const { data: waitlist, error: waitlistErr } = await client
    .from('event_waitlist')
    .select('full_name, email')
    .order('created_at', { ascending: true });

  if (waitlistErr) {
    console.error('Error fetching waitlist:', waitlistErr.message);
    return;
  }

  // 3. Deduplicate
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
  console.log(`🎯 Target Audience: ${targets.length} unique unpaid waitlist members.\n`);

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const { subject, html } = getEmailTemplate(emailId, t.name);

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

    await sleep(60);
  }

  console.log(`\n\n========================================`);
  console.log(`🎉 BROADCAST COMPLETED FOR [${emailId.toUpperCase()}]!`);
  console.log(`✅ Successfully Delivered: ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`========================================\n`);
}

module.exports = { runCampaign };

if (require.main === module) {
  const targetEmailId = process.argv[2];
  runCampaign(targetEmailId);
}
