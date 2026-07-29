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
const arkeselApiKey = env.ARKESEL_API_KEY;
const arkeselSenderId = env.ARKESEL_SENDER_ID || 'SENA';
const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';
const voiceId = '50404';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback hardcoded list of initial paid students
const INITIAL_PAID_EMAILS = [
  'ababioishmaelkwaku@gmail.com',
  'kntcalystagoe@st.knust.edu.gh',
  'elizabethasanteampomahowusu@gmail.com',
  'julius.amlor@stu.ucc.edu.gh',
  'ernestxorse3@gmail.com',
  'maequaye18@gmail.com',
  'aggreybeatrice73@gmail.com'
].map(e => e.toLowerCase().trim());

if (!brevoApiKey || !arkeselApiKey || !mnotifyApiKey) {
  console.error('[Error] Missing required API Keys in .env.local');
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

// Phone formatter helper
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

// Fetch paid users dynamically from Supabase to exclude
async function getPaidEmails() {
  if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('your_supabase_service_role_key')) {
    return INITIAL_PAID_EMAILS;
  }
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('email')
      .eq('status', 'success');

    if (error) throw error;
    const dynamicEmails = payments.map(p => p.email.toLowerCase().trim());
    return Array.from(new Set([...INITIAL_PAID_EMAILS, ...dynamicEmails]));
  } catch (err) {
    console.warn('[Warning] Failed to fetch paid emails. Falling back to initial list.');
    return INITIAL_PAID_EMAILS;
  }
}

// Send Email
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
    return response.ok;
  } catch (err) {
    return false;
  }
}

// Send SMS
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
      })
    });
    const data = await response.json();
    return response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000');
  } catch (err) {
    return false;
  }
}

// Trigger Voice Broadcast
async function triggerVoiceBroadcast(recipients) {
  console.log('\n--- STARTING AUTOMATED VOICE BROADCAST ---');
  if (recipients.length === 0) {
    console.log('No recipients for voice broadcast.');
    return;
  }

  try {
    console.log('Downloading audio template from mNotify storage...');
    const audioUrl = 'https://production.mnotify.com/storage/voice_files/A9JLk9YxekioLl9_20260727180022.mp3';
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error('Failed to download audio template');
    const audioBlob = await audioResponse.blob();

    const formData = new FormData();
    formData.append('campaign', 'Founding Builders Invitation');
    formData.append('file', audioBlob, 'enrollment.mp3');
    recipients.forEach(r => {
      formData.append('recipient[]', r);
    });

    const url = `https://api.mnotify.com/api/voice/quick?key=${mnotifyApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('mNotify Response Status:', response.status);
    console.log('mNotify Response Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('mNotify Voice Broadcast failed:', err.message);
  }
}

async function main() {
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
  const progressFile = path.join(__dirname, 'wednesday_evening_progress.json');

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

  const pending = contacts.filter(c => {
    const emailLower = c.email.toLowerCase().trim();
    return !paidEmails.includes(emailLower) && 
           !progress.sent.includes(c.email) && 
           !progress.failed.includes(c.email);
  });

  console.log('=============================================================');
  console.log('       SENA ACADEMY CAMPAIGN: WEDNESDAY EVENING DUAL PUSH');
  console.log('=============================================================');
  console.log(`Pending SMS/Email Recipients: ${pending.length}`);

  if (pending.length === 0) {
    console.log('All campaigns dispatched already.');
    process.exit(0);
  }

  console.log('\nStarting Email + SMS dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  const voiceRecipients = [];

  for (let i = 0; i < pending.length; i++) {
    const contact = pending[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const formattedPhone = formatPhone(contact.phone);

    // Evening templates
    const emailSubject = 'GHS 100 Discount: Closing Tomorrow Night';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">⏳ GHS 100 Discount: Closing Tomorrow Night</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hi ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Just a quick evening reminder that the Founding Builders GHS 100 discount expires tomorrow night (Thursday) at 11:59 PM.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">We kickoff live sessions this Saturday morning to start building real-world applications. Secure your seat and get your student dashboard access code before the price doubles to GHS 200.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://senaacademy.org/enroll" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Secure Your Founding Seat (GHS 100)</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    const smsText = `Hi ${firstName},\njust a quick reminder that the GHS 100 Founding Builder discount expires tomorrow night. 11 students have already enrolled. Secure your GHS 100 seat before the price returns to GHS 200: senaacademy.org/enroll`;

    console.log(`[${i + 1}/${pending.length}] Dispatching to ${contact.name}...`);

    const emailSent = await sendEmail(contact.email, contact.name, emailSubject, emailHtml);
    let smsSent = true;
    if (formattedPhone) {
      smsSent = await sendSMS(formattedPhone, smsText);
      voiceRecipients.push(formattedPhone);
    }

    if (emailSent && smsSent) {
      console.log(`[+] Successfully dispatched both Email and SMS!`);
      progress.sent.push(contact.email);
    } else {
      console.error(`[-] Dispatch failed.`);
      progress.failed.push(contact.email);
    }

    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nSMS & Email blast complete.');
  
  // Trigger voice broadcast immediately after
  await triggerVoiceBroadcast(voiceRecipients);
}

main().catch(console.error);
