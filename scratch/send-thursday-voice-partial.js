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

const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';
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

if (!mnotifyApiKey) {
  console.error('[Error] Missing mNotify API Key');
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

async function getVoiceBalance() {
  try {
    const res = await fetch(`https://api.mnotify.com/api/balance/voice?key=${mnotifyApiKey}`);
    const data = await res.json();
    if (data.status === 'success') {
      return parseInt(data.balance) || 0;
    }
    return 0;
  } catch (err) {
    console.error('Failed to check voice balance:', err.message);
    return 0;
  }
}

async function main() {
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
  if (!fs.existsSync(contactsFile)) {
    console.error('Error: waitlist_contacts.json not found.');
    process.exit(1);
  }

  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const paidEmails = await getPaidEmails();
  const currentBalance = await getVoiceBalance();

  console.log(`Current Voice Balance: ${currentBalance} units`);
  const costPerCall = 30; // 30 units per call for sped-up recording
  const maxCalls = Math.floor(currentBalance / costPerCall);
  console.log(`Max possible calls allowed by balance: ${maxCalls}`);

  if (maxCalls <= 0) {
    console.error('[-] Error: Balance is too low to send any calls.');
    process.exit(1);
  }

  // Filter out paid students
  const pending = contacts.filter(c => {
    const emailLower = c.email.toLowerCase().trim();
    return !paidEmails.includes(emailLower);
  });

  const allRecipients = [];
  pending.forEach(c => {
    const formatted = formatPhone(c.phone);
    if (formatted) {
      allRecipients.push(formatted);
    }
  });

  // Slice to fit within balance
  const targetRecipients = allRecipients.slice(0, maxCalls);

  console.log('=============================================================');
  console.log('       SENA ACADEMY AUTOMATED VOICE BROADCAST (PARTIAL)');
  console.log('=============================================================');
  console.log(`Total waitlist: ${allRecipients.length}`);
  console.log(`Calling subset: ${targetRecipients.length} recipients`);

  try {
    console.log('Reading local denoised audio file (S3NA_FINAL_cleaned.mp3)...');
    const audioPath = path.resolve(__dirname, 'S3NA_FINAL_cleaned.mp3');
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('campaign', 'Sena Academy Partial Call');
    formData.append('file', audioBlob, 'enrollment.mp3');
    targetRecipients.forEach(r => {
      formData.append('recipient[]', r);
    });

    console.log('Triggering mNotify voice API...');
    const url = `https://api.mnotify.com/api/voice/quick?key=${mnotifyApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('mNotify Response Status:', response.status);
    console.log('mNotify Response Data:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.status === 'success') {
      console.log(`[+] Voice Broadcast campaign initiated successfully to ${targetRecipients.length} recipients!`);
    } else {
      console.error('[-] Voice Broadcast failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('[-] Voice Broadcast failed:', err.message);
  }
}

main().catch(console.error);
