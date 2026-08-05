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
const senderId = 'SENA'; // Sender ID for Sena Academy

if (!arkeselApiKey) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

const messageText = `Sena Academy: Want to learn to build web apps using AI in 2 hours? Join our free live class this Saturday. Register free: senaacademy.org/waitlist?event=free-ai-masterclass`;

// Verify character count fits inside 1 single SMS segment (160 characters)
console.log(`Campaign message length: ${messageText.length} characters.`);
if (messageText.length > 160) {
  console.warn(`[Warning] Message exceeds 160 characters! It will count as ${Math.ceil(messageText.length / 153)} segments.`);
} else {
  console.log(`[Success] Message fits inside exactly 1 SMS segment (1 credit per contact).`);
}

async function sendSMSBatch(recipients) {
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
        recipients: recipients
      }),
      signal: AbortSignal.timeout(90000) // 90 seconds timeout
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
  const contactsFile = path.join(__dirname, 'new_campaign_contacts.json');
  const progressFile = path.join(__dirname, 'masterclass_campaign_progress.json');

  if (!fs.existsSync(contactsFile)) {
    console.error('Error: new_campaign_contacts.json not found. Run extract-contacts.py first.');
    process.exit(1);
  }

  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  let progress = { sent: [], failed: [] };
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }

  // Filter out already sent contacts
  const pending = contacts.filter(phone => {
    return !progress.sent.includes(phone) && !progress.failed.includes(phone);
  });

  console.log('=============================================================');
  console.log('         SENA ACADEMY COLD MASTERCLASS DISPATCH');
  console.log('=============================================================');
  console.log(`Total Extracted Contacts: ${contacts.length}`);
  console.log(`Already Sent: ${progress.sent.length}`);
  console.log(`Pending: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('All contacts have been successfully processed.');
    process.exit(0);
  }

  // Batching configuration
  const BATCH_SIZE = 500;
  const totalPending = pending.length;
  
  console.log(`Starting campaign batch dispatch (size: ${BATCH_SIZE}) in 3 seconds...`);
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < totalPending; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(totalPending / BATCH_SIZE);

    console.log(`[Batch ${batchNum}/${totalBatches}] Sending to ${batch.length} recipients...`);
    
    const res = await sendSMSBatch(batch);
    if (res.success) {
      console.log(`[+] Batch ${batchNum} Sent successfully! Remaining SMS Balance: ${res.balance}`);
      progress.sent.push(...batch);
    } else {
      console.error(`[-] Batch ${batchNum} Failed:`, res.error);
      
      if (res.error.toLowerCase().includes('balance') || res.error.toLowerCase().includes('credit') || res.error.includes('1004')) {
        console.warn('\n[!] Campaign paused due to insufficient wallet balance. Please top up your Arkesel account and run this script again to resume.');
        progress.failed.push(...batch);
        fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
        process.exit(0);
      } else {
        progress.failed.push(...batch);
      }
    }

    // Save progress after each batch
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    await new Promise(r => setTimeout(r, 1000)); // 1 second delay between batches
  }

  console.log('\nCampaign run complete.');
}

// NOTE: Self-execution prevented unless run via node directly.
if (require.main === module) {
  main().catch(console.error);
}
