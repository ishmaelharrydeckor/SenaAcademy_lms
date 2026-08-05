const fs = require('fs');
const path = require('path');

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
const senderId = 'ECHELON';

if (!arkeselApiKey) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

// Optimized 1-segment message generator (fits within 160 characters)
function generateMessage(firstName) {
  return `Hi ${firstName}, we start in 30 mins! Join the EN Study Success Series live room here: https://teams.live.com/meet/9376187419288?p=Rw61utzVx5i6TGC4cx | Echelon`;
}

async function sendSingleSMS(phone, messageText) {
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': arkeselApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: senderId,
        message: messageText,
        recipients: [phone]
      }),
      signal: AbortSignal.timeout(20000)
    });

    const data = await response.json();
    if (response.ok && (data.status === 'success' || data.code === 1000 || data.code === '1000')) {
      return { success: true, balance: data.sms_balance };
    }
    return { success: false, error: data.message || JSON.stringify(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const isTest = process.argv.includes('--test');
  const contactsFile = path.join(__dirname, 'echelon_contacts.json');
  const progressFile = path.join(__dirname, 'echelon_reminder_progress.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('[Error] echelon_contacts.json not found.');
    process.exit(1);
  }

  let contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  
  if (isTest) {
    console.log('\n--- Running in TEST MODE ---');
    contacts = [
      { firstName: 'TestUser', phone: '233555908380' }
    ];
  }

  let progress = { sent: [], failed: [] };
  if (fs.existsSync(progressFile) && !isTest) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }

  const pending = contacts.filter(c => {
    return !progress.sent.includes(c.phone) && !progress.failed.includes(c.phone);
  });

  console.log('=============================================================');
  console.log('            ECHELON 30-MINUTE REMINDER CAMPAIGN');
  console.log('=============================================================');
  console.log(`Total Contacts: ${contacts.length}`);
  console.log(`Already Sent: ${progress.sent.length}`);
  console.log(`Pending: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('[Info] All reminders sent successfully.');
    process.exit(0);
  }

  console.log('Starting campaign reminder dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  const CONCURRENCY_LIMIT = 20;
  
  for (let i = 0; i < pending.length; i += CONCURRENCY_LIMIT) {
    const chunk = pending.slice(i, i + CONCURRENCY_LIMIT);
    console.log(`[Sending Batch] Processing contacts ${i + 1} to ${Math.min(i + CONCURRENCY_LIMIT, pending.length)} of ${pending.length}...`);

    const promises = chunk.map(async (c) => {
      const msg = generateMessage(c.firstName);
      const res = await sendSingleSMS(c.phone, msg);
      if (res.success) {
        console.log(`[+] Sent to ${c.firstName} (${c.phone}). Bal: ${res.balance}`);
        progress.sent.push(c.phone);
      } else {
        console.error(`[-] Failed for ${c.firstName} (${c.phone}): ${res.error}`);
        
        if (res.error.toLowerCase().includes('balance') || res.error.toLowerCase().includes('credit') || res.error.includes('1004')) {
          console.warn('\n[!] Campaign paused due to insufficient wallet balance.');
          progress.failed.push(c.phone);
          if (!isTest) fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
          process.exit(0);
        } else {
          progress.failed.push(c.phone);
        }
      }
    });

    await Promise.all(promises);
    if (!isTest) {
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nReminder campaign complete.');
}

main().catch(console.error);
