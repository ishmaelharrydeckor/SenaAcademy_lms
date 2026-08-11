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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback hardcoded list of initial paid students
const INITIAL_PAID_STUDENTS = [
  { email: 'ababioishmaelkwaku@gmail.com', name: 'Ishmael' },
  { email: 'kntcalystagoe@st.knust.edu.gh', name: 'Calys-Tagoe' },
  { email: 'elizabethasanteampomahowusu@gmail.com', name: 'Elizabeth' },
  { email: 'julius.amlor@stu.ucc.edu.gh', name: 'Julius' },
  { email: 'ernestxorse3@gmail.com', name: 'Ernest' },
  { email: 'maequaye18@gmail.com', name: 'Mae' },
  { email: 'aggreybeatrice73@gmail.com', name: 'Beatrice' }
];

if (!brevoApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing required config keys in .env.local');
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
    return response.ok;
  } catch (err) {
    return false;
  }
}

async function getPaidStudents() {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('email, full_name')
      .eq('status', 'success');

    if (error) throw error;
    
    // Create unique map of email -> student
    const studentMap = new Map();
    
    // Add initial manual entries
    INITIAL_PAID_STUDENTS.forEach(s => {
      studentMap.set(s.email.toLowerCase().trim(), s);
    });

    // Merge Supabase entries
    payments.forEach(p => {
      const email = p.email.toLowerCase().trim();
      const name = p.full_name.split(' ')[0] || 'Builder';
      studentMap.set(email, { email, name });
    });

    return Array.from(studentMap.values());
  } catch (err) {
    console.warn('[Warning] Failed to query payments from Supabase, falling back to manual list.', err.message);
    return INITIAL_PAID_STUDENTS;
  }
}

async function main() {
  const students = await getPaidStudents();
  console.log(`Loaded ${students.length} paid students.`);

  console.log('\nStarting email campaign dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const subject = 'Welcome to the Founding Builders Cohort (WhatsApp Group)';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">🚀 Welcome to the Cohort!</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${student.name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Congratulations on securing your seat in the Founding Builders Cohort! We are excited to build with you.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">We kickoff our live learning sessions this Saturday morning (August 1st). </p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Please join the official WhatsApp group for the cohort to access class resources, meet your classmates, and ask questions:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://chat.whatsapp.com/BzkZeymD7IfDM6SsOlbhXs?s=cl&p=a&ilr=1" style="background-color: #25d366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Join the Cohort WhatsApp Group</a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 20px 0;">Or copy this link directly:<br>
        <a href="https://chat.whatsapp.com/BzkZeymD7IfDM6SsOlbhXs?s=cl&p=a&ilr=1" style="color: #0f172a; text-decoration: underline;">https://chat.whatsapp.com/BzkZeymD7IfDM6SsOlbhXs?s=cl&p=a&ilr=1</a></p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${students.length}] Sending welcome email to ${student.email}...`);
    const sent = await sendEmail(student.email, student.name, subject, htmlContent);
    if (sent) {
      console.log(`[+] Sent to ${student.email}`);
    } else {
      console.error(`[-] Failed to send to ${student.email}`);
    }

    await new Promise(r => setTimeout(r, 300)); // 300ms delay
  }

  console.log('\nEmail dispatch complete.');
}

main().catch(console.error);
