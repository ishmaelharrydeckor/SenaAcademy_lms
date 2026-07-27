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

// mNotify credentials
const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';
const voiceId = '50404'; // Retrieved dynamically via template API

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

// Phone formatter helper (Converts local to international format required by mNotify)
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

async function run() {
  const isTest = process.argv.includes('--test');
  const contactsFile = path.join(__dirname, 'waitlist_contacts.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('Error: waitlist_contacts.json not found.');
    process.exit(1);
  }

  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  const paidEmails = await getPaidEmails();

  let targetContacts = [];

  if (isTest) {
    console.log('\n--- running in TEST MODE ---');
    targetContacts = [
      { name: 'Test User', phone: '0555908380', email: 'test@senaacademy.org' }
    ];
  } else {
    // Filter out people who have already paid
    targetContacts = contacts.filter(c => {
      const emailLower = c.email.toLowerCase().trim();
      return !paidEmails.includes(emailLower) && c.phone;
    });
  }

  // Format phones for mNotify
  const recipients = targetContacts
    .map(c => formatPhone(c.phone))
    .filter(Boolean);

  console.log('=============================================================');
  console.log('           SENA ACADEMY AUTOMATED VOICE BROADCAST');
  console.log('=============================================================');
  console.log(`Voice File URL: https://production.mnotify.com/storage/voice_files/A9JLk9YxekioLl9_20260727180022.mp3`);
  console.log(`Targeting Recipients: ${recipients.length}`);
  
  if (recipients.length === 0) {
    console.log('No recipients to call.');
    process.exit(0);
  }

  console.log('\nSample contacts:', recipients.slice(0, 5));
  console.log('\nTriggering mNotify voice API...');

  try {
    // Download the pre-uploaded mp3 file on the fly
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
    console.log('\nmNotify Response Status:', response.status);
    console.log('mNotify Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.status === 'success') {
      console.log('\n[+] Voice Broadcast campaign initiated successfully!');
    } else {
      console.error('\n[-] Voice Broadcast failed:', data.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error('\n[-] Network/API Error:', err.message);
  }
}

run();
