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

const INITIAL_PAID_EMAILS = [
  'ababioishmaelkwaku@gmail.com',
  'kntcalystagoe@st.knust.edu.gh',
  'elizabethasanteampomahowusu@gmail.com',
  'julius.amlor@stu.ucc.edu.gh',
  'ernestxorse3@gmail.com',
  'maequaye18@gmail.com',
  'aggreybeatrice73@gmail.com'
].map(e => e.toLowerCase().trim());

if (!arkeselApiKey) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
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
    return INITIAL_PAID_EMAILS;
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
    return response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000');
  } catch (err) {
    return false;
  }
}

async function main() {
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
  const progressFile = path.join(__dirname, 'thursday_6pm_progress.json');

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
  console.log('       SENA ACADEMY COHORT: THURSDAY 6PM (6H COUNTDOWN)');
  console.log('=============================================================');
  console.log(`Pending SMS Recipients: ${pending.length}`);

  if (pending.length === 0) {
    console.log('All campaigns dispatched already.');
    process.exit(0);
  }

  console.log('\nStarting SMS dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < pending.length; i++) {
    const contact = pending[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const formattedPhone = formatPhone(contact.phone);

    // 6-Hour Expiry SMS copy (beginner friendly)
    const smsText = `Hi ${firstName},\njust 6 hours left. We are closing the GHS 100 discount at 11:59 PM. Don't spend the rest of the year wishing you learned tech—start building this Saturday. Get your seat: senaacademy.org/enroll`;

    console.log(`[${i + 1}/${pending.length}] Dispatching to ${contact.name}...`);

    let smsSent = false;
    if (formattedPhone) {
      smsSent = await sendSMS(formattedPhone, smsText);
    }

    if (smsSent) {
      console.log(`[+] Successfully dispatched SMS!`);
      progress.sent.push(contact.email);
    } else {
      console.error(`[-] Dispatch failed.`);
      progress.failed.push(contact.email);
    }

    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    await new Promise(r => setTimeout(r, 1000)); // 1s delay
  }

  console.log('\n6PM SMS blast complete.');
}

main().catch(console.error);
