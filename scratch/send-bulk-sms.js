const fs = require('fs');
const path = require('path');

// Excluded emails of students who have already paid
const EXCLUDED_EMAILS = [
  'ababioishmaelkwaku@gmail.com',
  'kntcalystagoe@st.knust.edu.gh',
  'elizabethasanteampomahowusu@gmail.com',
  'julius.amlor@stu.ucc.edu.gh',
  'ernestxorse3@gmail.com',
  'maequaye18@gmail.com',
  'aggreybeatrice73@gmail.com'
].map(email => email.toLowerCase().trim());

// Load env variables
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

const apiKey = env.ARKESEL_API_KEY;
const senderId = env.ARKESEL_SENDER_ID || 'SENA';

if (!apiKey) {
  console.error('[Error] ARKESEL_API_KEY is missing in your .env.local file.');
  process.exit(1);
}

// Contacts and Progress files
const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
const progressFile = path.join(__dirname, 'sms_progress.json');

if (!fs.existsSync(contactsFile)) {
  console.error(`[Error] Contacts file not found at: ${contactsFile}`);
  process.exit(1);
}

const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));

// Initialize progress
let progress = { sent: [], failed: [] };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

// Filter pending contacts
const pendingContacts = contacts.filter(c => {
  const emailLower = c.email.toLowerCase().trim();
  return !EXCLUDED_EMAILS.includes(emailLower) && 
         !progress.sent.includes(c.email) && 
         !progress.failed.includes(c.email);
});

// Helper to format phone to international standard (e.g. 233XXXXXXXXX)
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

// Helper to send SMS via Arkesel v2 API
async function sendSMS(recipientPhone, messageText, useSenderId) {
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: useSenderId,
        message: messageText,
        recipients: [recipientPhone]
      })
    });

    const data = await response.json();
    // Arkesel response format for success is usually: { status: 'success', code: '1000', ... }
    if (response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000')) {
      return { success: true, data };
    }
    return { success: false, error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Main handler
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0]; // 'test' or 'send'
  const testPhoneInput = args[1];

  if (!mode || (mode !== 'test' && mode !== 'send')) {
    console.log('Usage:');
    console.log('  node scratch/send-bulk-sms.js test [phone_number]  -> Test with a single number');
    console.log('  node scratch/send-bulk-sms.js send                -> Send to the entire waitlist');
    process.exit(0);
  }

  if (mode === 'test') {
    if (!testPhoneInput) {
      console.error('[Error] Please specify a phone number for the test: e.g. 0244000000');
      process.exit(1);
    }
    const formattedTestPhone = formatPhone(testPhoneInput);
    console.log(`\n--- Running TEST SMS to ${formattedTestPhone} ---`);
    
    // Try sending with the user's custom Sender ID 'SENA' first
    const message = `Hi Tester,\n\nIshmael here from Sena Academy. This is a test to verify if the Sender ID works.\n\nComplete enrollment:\nhttps://senaacademy.org/enroll`;
    console.log(`Sending message with Sender ID: "${senderId}"...`);
    let result = await sendSMS(formattedTestPhone, message, senderId);
    
    if (result.success) {
      console.log(`[+] Test SMS sent successfully using Sender ID "${senderId}"!`);
      console.log('API Response:', result.data);
    } else {
      console.error(`[-] Failed sending with "${senderId}":`, result.error);
      console.log(`\nRetrying with fallback default Sender ID "Arkesel"...`);
      result = await sendSMS(formattedTestPhone, message, 'Arkesel');
      if (result.success) {
        console.log(`[+] Test SMS sent successfully using fallback "Arkesel"!`);
      } else {
        console.error(`[-] Fallback also failed:`, result.error);
      }
    }
    process.exit(0);
  }

  // Bulk Send mode
  console.log('=============================================================');
  console.log('       SENA ACADEMY OUTREACH: BULK SMS CAMPAIGN');
  console.log('=============================================================');
  console.log(`Total Waitlist Contacts: ${contacts.length}`);
  console.log(`Excluded (Already Paid): ${EXCLUDED_EMAILS.length}`);
  console.log(`Already Sent in campaign: ${progress.sent.length}`);
  console.log(`Pending for this run: ${pendingContacts.length}`);
  console.log(`Using Sender ID: "${senderId}"`);

  if (pendingContacts.length === 0) {
    console.log('\nAll pending SMS have been sent! Nothing to do.');
    process.exit(0);
  }

  // Verify Sender ID by sending a dummy test or warn user
  console.log('\nStarting campaign in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  for (let i = 0; i < pendingContacts.length; i++) {
    const contact = pendingContacts[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const formattedPhone = formatPhone(contact.phone);

    if (!formattedPhone) {
      console.log(`[${i + 1}/${pendingContacts.length}] Skipping ${contact.name} - No valid phone number.`);
      progress.failed.push(contact.email);
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
      continue;
    }

    const message = `Hi ${firstName},\n\nIshmael here from Sena Academy.\n\nAdmissions for the Founding Builders Cohort starting this Saturday are filling up. We just sent access codes to the latest batch of trainees who enrolled at the GHS 100 discount.\n\nComplete enrollment here:\nhttps://senaacademy.org/enroll\n\nCohort Group:\nhttps://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e`;

    console.log(`[${i + 1}/${pendingContacts.length}] Sending SMS to ${contact.name} (${formattedPhone})...`);
    
    const result = await sendSMS(formattedPhone, message, senderId);

    if (result.success) {
      console.log(`[+] Sent successfully!`);
      progress.sent.push(contact.email);
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    } else {
      console.error(`[-] Failed:`, result.error);
      
      // If error is likely due to the unapproved Sender ID, log it clearly
      if (result.error.toLowerCase().includes('sender') || result.error.toLowerCase().includes('allow')) {
        console.log(`\n[ALERT] Sender ID "${senderId}" might not be approved yet. Please run the test first or change ARKESEL_SENDER_ID to "Arkesel" in your .env.local file.`);
        process.exit(1);
      }
      
      progress.failed.push(contact.email);
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    }

    // Short delay to avoid rate limit spikes
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  console.log('\nSMS Campaign dispatch finished.');
}

main().catch(console.error);
