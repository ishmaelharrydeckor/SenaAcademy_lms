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

if (!brevoApiKey || !arkeselApiKey) {
  console.error('[Error] Missing BREVO_API_KEY or ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

// 2. Fetch paid users dynamically from Supabase if key is present
async function getPaidEmails() {
  if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('your_supabase_service_role_key')) {
    console.log('[Info] Using initial paid email list (Service Role Key not configured locally).');
    return INITIAL_PAID_EMAILS;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: payments, error } = await supabase
      .from('payments')
      .select('email')
      .eq('status', 'success');

    if (error) throw error;
    const dynamicEmails = payments.map(p => p.email.toLowerCase().trim());
    console.log(`[+] Loaded ${dynamicEmails.length} paid students dynamically from Supabase.`);
    return Array.from(new Set([...INITIAL_PAID_EMAILS, ...dynamicEmails]));
  } catch (err) {
    console.warn('[Warning] Failed to fetch paid emails from Supabase. Falling back to initial list:', err.message);
    return INITIAL_PAID_EMAILS;
  }
}

// 3. Sender ID Config
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

// Send APIs
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
  const progressFile = path.join(__dirname, 'wednesday_campaign_progress.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('Waitlist contacts file not found.');
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
  console.log('       SENA ACADEMY CAMPAIGN: WEDNESDAY (48H EXPIRY)');
  console.log('=============================================================');
  console.log(`Pending Recipients: ${pending.length}`);

  if (pending.length === 0) {
    console.log('All pending campaigns dispatched!');
    process.exit(0);
  }

  console.log('\nDispatching in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < pending.length; i++) {
    const contact = pending[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const formattedPhone = formatPhone(contact.phone);

    // Wednesday templates
    const emailSubject = 'Action Required: GHS 100 discount expires in 48 hours';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">⏳ GHS 100 Discount: 48 Hours Remaining</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hi ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">This is a quick warning that the special **GHS 100 Founding Builder discount** (regular GHS 200) expires in exactly **48 hours**—this Thursday night at 11:59 PM.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">Once this deadline passes, admissions for the cohort will automatically return to the regular rate of GHS 200.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155;">If you are ready to gain full-stack skills, join the community, and build your own applications from scratch starting this Saturday, secure your seat today.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://senaacademy.org/enroll" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Complete Your Enrollment (GHS 100)</a>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">If you want to join support channels first, join our pre-cohort WhatsApp group:<br>
        <a href="https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e" style="color: #0f172a; text-decoration: underline; font-weight: 500;">https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    const smsText = `Hi ${firstName},\nthe GHS 100 discount (regularly GHS 200) for Founding Builders expires in 48 hours. Secure GHS 100 seat: senaacademy.org/enroll`;

    console.log(`[${i + 1}/${pending.length}] Dispatching to ${contact.name}...`);

    // Send Email
    const emailRes = await sendEmail(contact.email, contact.name, emailSubject, emailHtml);
    
    // Send SMS (if valid phone)
    let smsRes = { success: true };
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
    
    // 1.5 seconds delay between recipients
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nWednesday campaign finished.');
}

main().catch(console.error);
