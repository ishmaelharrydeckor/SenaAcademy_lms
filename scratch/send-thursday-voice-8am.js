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

async function main() {
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
  if (!fs.existsSync(contactsFile)) {
    console.error('Error: waitlist_contacts.json not found.');
    process.exit(1);
  }

  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const paidEmails = await getPaidEmails();

  // Filter out paid students
  const pending = contacts.filter(c => {
    const emailLower = c.email.toLowerCase().trim();
    return !paidEmails.includes(emailLower);
  });

  const voiceRecipients = [];
  pending.forEach(c => {
    const formatted = formatPhone(c.phone);
    if (formatted) {
      voiceRecipients.push(formatted);
    }
  });

  console.log('=============================================================');
  console.log('       SENA ACADEMY AUTOMATED VOICE BROADCAST (THURSDAY 8AM)');
  console.log('=============================================================');
  console.log(`Recipients to call: ${voiceRecipients.length}`);

  if (voiceRecipients.length === 0) {
    console.log('No recipients for voice broadcast.');
    process.exit(0);
  }

  try {
    console.log('Reading local denoised audio file (S3NA_FINAL_cleaned.mp3)...');
    const audioPath = path.resolve(__dirname, 'S3NA_FINAL_cleaned.mp3');
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Processed audio file not found at: ${audioPath}`);
    }
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('campaign', 'Sena Academy Thursday 8AM Call');
    formData.append('file', audioBlob, 'enrollment.mp3');
    voiceRecipients.forEach(r => {
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
      console.log('[+] Thursday 8AM Voice Broadcast campaign initiated successfully!');
    } else {
      console.error('[-] Voice Broadcast failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('[-] Voice Broadcast failed:', err.message);
  }
}

main().catch(console.error);
