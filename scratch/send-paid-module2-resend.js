const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

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

const resendApiKey = env.RESEND_API_KEY;
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

if (!resendApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing required configurations in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

// Sender details
const senderEnv = env.SENDER_EMAIL || 'Sena Academy <support@senaacademy.org>';
let senderName = 'Sena Academy';
let senderEmail = 'support@senaacademy.org';
const match = senderEnv.match(/^(.*?)\s*<(.*?)>$/);
if (match) {
  senderName = match[1].trim();
  senderEmail = match[2].trim();
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

async function main() {
  const paidStudents = await getPaidStudents();
  console.log(`[+] Loaded ${paidStudents.length} paid students.`);

  const teamsLink = 'https://teams.live.com/meet/9380470344303?p=uBwrHXGFSS2GTGEgO7';

  console.log('\nStarting Resend email dispatch to all paid students in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < paidStudents.length; i++) {
    const student = paidStudents[i];

    const emailSubject = '🔴 Live Now: Module 2 Session (7:00 PM GMT)';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #ef4444; padding-bottom: 15px;">🔴 Live Now: Module 2 Session</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${student.name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Our live session for **Module 2** of the Founding Builders Cohort is starting right now!</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Please click the button below to join the Microsoft Teams meeting room:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${teamsLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Join Module 2 Live Session</a>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 13.5px; line-height: 1.6; color: #475569;">
          <strong>Tip:</strong> If you are on a phone, make sure you have the Microsoft Teams app installed. On laptop/desktop, you can join directly via browser without installing any software.
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${paidStudents.length}] Resend emailing ${student.name} (${student.email})...`);
    
    try {
      const data = await resend.emails.send({
        from: `${senderName} <${senderEmail}>`,
        to: [student.email],
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[+] Resend Success for ${student.email}`);
    } catch (err) {
      console.error(`[-] Resend Failed for ${student.email}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\nResend email dispatch complete.');
}

main().catch(console.error);
