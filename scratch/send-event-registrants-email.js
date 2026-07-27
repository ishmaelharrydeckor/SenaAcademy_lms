const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
}

const brevoApiKey = env.BREVO_API_KEY_SECONDARY || env.BREVO_API_KEY;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!brevoApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing BREVO_API_KEY or Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sender details
const senderEnv = env.SENDER_EMAIL || 'Sena Academy <support@senaacademy.org>';
let senderName = 'Sena Academy';
let senderEmail = 'support@senaacademy.org';
const match = senderEnv.match(/^(.*?)\s*<(.*?)>$/);
if (match) {
  senderName = match[1].trim();
  senderEmail = match[2].trim();
}

async function sendEmail(toEmail, recipientName, subject, htmlContent) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });
    const data = await response.json();
    return response.ok ? { success: true } : { success: false, error: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const progressFile = path.join(__dirname, 'event_registrants_email_progress.json');

  // Load progress
  let progress = { sent: [], failed: [] };
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }

  console.log('Fetching event registrants and paid transactions from Supabase...');

  // Fetch all registrations
  const { data: registrants, error: rError } = await supabase
    .from('event_registrations')
    .select('full_name, email');

  if (rError) {
    console.error('Error fetching event registrations:', rError.message);
    process.exit(1);
  }

  // Fetch paid emails to exclude
  const { data: payments, error: pError } = await supabase
    .from('payments')
    .select('email')
    .eq('status', 'success');

  const paidEmails = (payments || []).map(p => p.email.toLowerCase().trim());
  if (pError) {
    console.warn('[Warning] Failed to fetch payments, using empty exclusion list:', pError.message);
  }

  // Filter pending registrants
  const pending = registrants.filter(r => {
    const emailLower = r.email.toLowerCase().trim();
    return !paidEmails.includes(emailLower) && 
           !progress.sent.includes(r.email) && 
           !progress.failed.includes(r.email);
  });

  console.log('=============================================================');
  console.log('       SENA ACADEMY OUTREACH: EVENT REGISTRANTS COHORT INVITE');
  console.log('=============================================================');
  console.log(`Total Event RSVPs: ${registrants.length}`);
  console.log(`Excluded (Already Paid): ${paidEmails.length}`);
  console.log(`Already Sent: ${progress.sent.length}`);
  console.log(`Pending for this run: ${pending.length}`);

  if (pending.length === 0) {
    console.log('\nAll pending emails sent! Nothing to do.');
    process.exit(0);
  }

  console.log('\nStarting email campaign in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  for (let i = 0; i < pending.length; i++) {
    const contact = pending[i];
    const firstName = contact.full_name.trim().split(' ')[0] || 'Builder';

    const subject = 'Founding Builders: From session to code';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">Founding Builders: From session to code</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Thank you for RSVPing to our builder sessions at Sena Academy.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Admissions for our first hands-on training cohort, the Founding Builders Cohort, are filling up. We kickoff live sessions this Saturday, August 1st.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">If you are ready to move from attending sessions to actually building and deploying frontends, cloud backends, and installable Android apps, secure your seat at the special GHS 100 price (regular GHS 200).</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://senaacademy.org/enroll" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Secure Your Founding Seat (GHS 100)</a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 20px 0;">If you have any questions or want to join cohort support chats, join our WhatsApp group here:<br>
        <a href="https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e" style="color: #0f172a; text-decoration: underline; font-weight: 500;">https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e</a></p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">See you in the first session this Saturday.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${pending.length}] Sending email to ${contact.full_name} (${contact.email})...`);

    const result = await sendEmail(contact.email, contact.full_name, subject, htmlContent);

    if (result.success) {
      console.log(`[+] Sent successfully!`);
      progress.sent.push(contact.email);
    } else {
      console.error(`[-] Failed:`, result.error);
      progress.failed.push(contact.email);
    }

    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));

    // Wait 1.5 seconds between sends
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('\nEvent registrants email campaign finished.');
}

main().catch(console.error);
