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

const arkeselApiKey = env.ARKESEL_API_KEY;
const arkeselSenderId = env.ARKESEL_SENDER_ID || 'SENA';
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback manual emails
const INITIAL_PAID_STUDENTS = [
  { email: 'ababioishmaelkwaku@gmail.com', name: 'Ishmael' },
  { email: 'kntcalystagoe@st.knust.edu.gh', name: 'Calys-Tagoe' },
  { email: 'elizabethasanteampomahowusu@gmail.com', name: 'Elizabeth' },
  { email: 'julius.amlor@stu.ucc.edu.gh', name: 'Julius' },
  { email: 'ernestxorse3@gmail.com', name: 'Ernest' },
  { email: 'maequaye18@gmail.com', name: 'Mae' },
  { email: 'aggreybeatrice73@gmail.com', name: 'Beatrice' }
];

if (!arkeselApiKey || !supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing configuration keys in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    return response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000');
  } catch (err) {
    return false;
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

  console.log(`Loaded ${paidStudents.length} paid students.`);
  
  // Create email -> phone lookup map from waitlist
  const phoneLookup = new Map();
  waitlist.forEach(c => {
    const emailKey = c.email.toLowerCase().trim();
    if (c.phone) {
      phoneLookup.set(emailKey, c.phone);
    }
  });

  console.log('Starting WhatsApp link SMS dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < paidStudents.length; i++) {
    const student = paidStudents[i];
    const rawPhone = phoneLookup.get(student.email.toLowerCase().trim());
    const formatted = formatPhone(rawPhone);

    if (!formatted) {
      console.warn(`[-] No phone number found in waitlist for paid student: ${student.email}`);
      continue;
    }

    const smsText = `Hi ${student.name}, welcome to Sena Academy! Join the official WhatsApp group for the Founding Builders Cohort here: https://chat.whatsapp.com/BzkZeymD7IfDM6SsOlbhXs?s=cl&p=a&ilr=1 Class starts Saturday morning!`;

    console.log(`[${i + 1}/${paidStudents.length}] Sending WhatsApp link SMS to ${student.name} (${formatted})...`);
    const sent = await sendSMS(formatted, smsText);
    if (sent) {
      console.log(`[+] SMS Sent successfully.`);
    } else {
      console.error(`[-] SMS Failed.`);
    }

    await new Promise(r => setTimeout(r, 300)); // 300ms delay
  }

  console.log('\nSMS dispatch complete.');
}

main().catch(console.error);
