const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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
const arkeselApiKey = env.ARKESEL_API_KEY;
const arkeselSenderId = env.ARKESEL_SENDER_ID || 'SENA';
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const INITIAL_PAID_EMAILS = [
  'ababioishmaelkwaku@gmail.com',
  'kntcalystagoe@st.knust.edu.gh',
  'elizabethasanteampomahowusu@gmail.com',
  'julius.amlor@stu.ucc.edu.gh',
  'ernestxorse3@gmail.com',
  'maequaye18@gmail.com',
  'aggreybeatrice73@gmail.com'
].map(e => e.toLowerCase().trim());

if (!brevoApiKey || !arkeselApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing required configurations in .env.local');
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

function formatPhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.slice(1);
  } else if (cleaned.startsWith('33')) {
    cleaned = '2' + cleaned;
  } else if (!cleaned.startsWith('233') && cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  return cleaned;
}

async function getPaidEmails() {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('email')
      .eq('status', 'success');

    if (error) throw error;
    const dynamicEmails = payments.map(p => p.email.toLowerCase().trim());
    return Array.from(new Set([...INITIAL_PAID_EMAILS, ...dynamicEmails]));
  } catch (err) {
    return INITIAL_PAID_EMAILS;
  }
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
      }),
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    return response.ok ? { success: true } : { success: false, error: data.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendSMS(recipientPhone, messageText) {
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': arkeselApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: arkeselSenderId,
        message: messageText,
        recipients: [recipientPhone]
      }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    if (response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000')) {
      return { success: true };
    }
    return { success: false, error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
  const progressFile = path.join(__dirname, 'discount_reminder_progress.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('Error: waitlist_contacts.json not found.');
    process.exit(1);
  }

  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const paidEmails = await getPaidEmails();

  let progress = { sent: [], failed: [] };
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }

  // Filter out paid students
  const pending = contacts.filter(c => {
    const emailLower = c.email.toLowerCase().trim();
    const alreadySent = progress.sent.includes(c.email) || progress.failed.includes(c.email);
    return !paidEmails.includes(emailLower) && !alreadySent;
  });

  console.log(`[+] Loaded ${paidEmails.length} paid students dynamically from Supabase.`);
  console.log('=============================================================');
  console.log('  SENA ACADEMY CAMPAIGN: DISCOUNT EXTENSION FINAL REMINDER');
  console.log('=============================================================');
  console.log(`Pending Recipients: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('All pending recipients have been processed.');
    process.exit(0);
  }

  console.log('Starting campaign dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < pending.length; i++) {
    const contact = pending[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const formattedPhone = formatPhone(contact.phone);

    const smsText = `Sena Academy: Roster lock is scheduled for 8:00 AM tomorrow. To ensure your student portal access is configured before class begins, complete your registration tonight at the GHS 100 early-bird rate. Price increases to GHS 200 at 8 AM. Secure seat: https://senaacademy.org/enroll`;

    const emailSubject = 'Action Required: Founding Builders Roster Lock (8:00 AM Tomorrow)';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #0f172a; padding-bottom: 15px;">🔒 Founding Builders: Roster Lock at 8:00 AM Tomorrow</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">We are currently running database syncs and setting up student portal accounts for the Founding Builders Cohort kickoff tomorrow morning (August 1st).</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">To accommodate late applicants and ensure everyone on the waitlist has an opportunity to complete onboarding, we are keeping the <strong>GHS 100</strong> early-bird registration open until <strong>exactly 8:00 AM GMT tomorrow</strong>.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">After 8:00 AM, the cohort roster will lock, and registration pricing will revert to the standard price of <strong>GHS 200</strong> permanently to cover late onboarding setup overhead.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0f172a; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Founding Builders Cohort Onboarding:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.6; color: #475569;">
            <li style="margin-bottom: 8px;"><strong>Kickoff Class:</strong> Tomorrow (Saturday, August 1st) at 9:00 AM GMT.</li>
            <li style="margin-bottom: 8px;"><strong>Roster Lock & Cut-off:</strong> 8:00 AM GMT tomorrow (pricing reverts to GHS 200).</li>
            <li style="margin-bottom: 0;"><strong>Opportunity:</strong> A single basic client freelance website or database project will pay back this GHS 100 investment multiple times over.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://senaacademy.org/enroll" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Complete Onboarding & Secure GHS 100 Seat</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${pending.length}] Dispatching reminder to ${contact.name}...`);
    const emailRes = await sendEmail(contact.email, contact.name, emailSubject, emailHtml);
    
    let smsRes = { success: false, error: 'No phone number' };
    if (formattedPhone) {
      smsRes = await sendSMS(formattedPhone, smsText);
    }

    if (emailRes.success && smsRes.success) {
      console.log(`[+] Successfully dispatched both Email and SMS!`);
      progress.sent.push(contact.email);
    } else {
      console.error(`[-] Dispatch failed. Email: ${emailRes.success ? 'OK' : emailRes.error}. SMS: ${smsRes.success ? 'OK' : smsRes.error}`);
      progress.failed.push(contact.email);
    }

    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nDiscount extension reminder campaign complete.');
}

main().catch(console.error);
