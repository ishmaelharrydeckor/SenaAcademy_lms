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

// SMS generator helper
function generateMessage(firstName) {
  return `Hi ${firstName}, JUST 4 HOURS TO GO!!
Don't just attend another webinar—invest in yourself. Join the EN Study Success Series at 8:00 PM and discover practical strategies for using AI, boosting productivity, and growing beyond the classroom. 
Join here: https://teams.live.com/meet/9376187419288?p=Rw61utzVx5i6TGC4cx  | Echelon Networking`;
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
      signal: AbortSignal.timeout(20000) // 20s timeout per call
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
  const progressFile = path.join(__dirname, 'echelon_progress.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('[Error] echelon_contacts.json not found. Run extract-echelon-contacts.py first.');
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
  console.log('               ECHELON NETWORKING CAMPAIGN');
  console.log('=============================================================');
  console.log(`Total Contacts: ${contacts.length}`);
  console.log(`Already Sent: ${progress.sent.length}`);
  console.log(`Pending: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('[Info] All contacts processed successfully!');
    process.exit(0);
  }

  console.log('Starting personalized campaign dispatch in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  // Concurrency batch size
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
        
        // If balance is critically low, exit to let user top up
        if (res.error.toLowerCase().includes('balance') || res.error.toLowerCase().includes('credit') || res.error.includes('1004')) {
          console.warn('\n[!] Campaign paused due to insufficient wallet balance. Please top up your Arkesel account and run this script again.');
          progress.failed.push(c.phone);
          if (!isTest) fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
          process.exit(0);
        } else {
          progress.failed.push(c.phone);
        }
      }
    });

    await Promise.all(promises);
    
    // Save progress file after each batch run
    if (!isTest) {
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    }
    
    // 1-second throttle delay between concurrent batches
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nCampaign run complete.');
}

main().catch(console.error);
