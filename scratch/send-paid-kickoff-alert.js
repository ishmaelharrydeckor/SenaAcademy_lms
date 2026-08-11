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

const INITIAL_PAID_STUDENTS = [
  { email: 'ababioishmaelkwaku@gmail.com', name: 'Ishmael' },
  { email: 'kntcalystagoe@st.knust.edu.gh', name: 'Calys-Tagoe' },
  { email: 'elizabethasanteampomahowusu@gmail.com', name: 'Elizabeth' },
  { email: 'julius.amlor@stu.ucc.edu.gh', name: 'Julius' },
  { email: 'ernestxorse3@gmail.com', name: 'Ernest' },
  { email: 'maequaye18@gmail.com', name: 'Mae' },
  { email: 'aggreybeatrice73@gmail.com', name: 'Beatrice' }
];

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

async function getPaidStudents() {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('email, full_name')
      .eq('status', 'success');

    if (error) throw error;
    
    const studentMap = new Map();
    INITIAL_PAID_STUDENTS.forEach(s => {
      studentMap.set(s.email.toLowerCase().trim(), s);
    });

    payments.forEach(p => {
      const email = p.email.toLowerCase().trim();
      const name = p.full_name.split(' ')[0] || 'Builder';
      studentMap.set(email, { email, name });
    });

    return Array.from(studentMap.values());
  } catch (err) {
    return INITIAL_PAID_STUDENTS;
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
  if (!fs.existsSync(contactsFile)) {
    console.error('waitlist_contacts.json not found.');
    process.exit(1);
  }

  const waitlist = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const paidStudents = await getPaidStudents();

  console.log(`[+] Loaded ${paidStudents.length} paid students.`);
  
  const phoneLookup = new Map();
  waitlist.forEach(c => {
    const emailKey = c.email.toLowerCase().trim();
    if (c.phone) {
      phoneLookup.set(emailKey, c.phone);
    }
  });

  const teamsLink = 'https://teams.live.com/meet/9367755420579?p=TeOFgRYMRkEU9hbsVf';

  console.log('\nStarting kickoff session alerts dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < paidStudents.length; i++) {
    const student = paidStudents[i];
    const rawPhone = phoneLookup.get(student.email.toLowerCase().trim());
    const formattedPhone = formatPhone(rawPhone);

    const smsText = `Sena Academy: The Founding Builders kickoff session is starting right now! Join the live class here: ${teamsLink}`;

    const emailSubject = '🔴 Starting Now: Founding Builders Kickoff Session';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #ef4444; padding-bottom: 15px;">🔴 Live Now: Cohort Kickoff Session</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${student.name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">The live kickoff learning session for the Founding Builders Cohort is starting right now!</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Please click the button below to join the Microsoft Teams meeting room immediately:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${teamsLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Join Live Session on Teams</a>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 13.5px; line-height: 1.6; color: #475569;">
          <strong>Tip:</strong> If you are on a phone, make sure you have the Microsoft Teams app installed. On laptop/desktop, you can join directly via browser without installing any software.
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${paidStudents.length}] Alerting paid student ${student.name} (${student.email})...`);
    
    // Dispatch Email
    const emailRes = await sendEmail(student.email, student.name, emailSubject, emailHtml);
    
    // Dispatch SMS
    let smsRes = { success: false, error: 'No phone number in waitlist' };
    if (formattedPhone) {
      smsRes = await sendSMS(formattedPhone, smsText);
    }

    if (emailRes.success && smsRes.success) {
      console.log(`[+] Successfully sent both Email and SMS to ${student.name}`);
    } else {
      console.error(`[-] Dispatch alert failed. Email: ${emailRes.success ? 'OK' : emailRes.error}. SMS: ${smsRes.success ? 'OK' : smsRes.error}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nPaid kickoff alert dispatch complete.');
}

main().catch(console.error);
