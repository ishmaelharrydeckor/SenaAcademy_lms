const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

// EXACT CLEAN MESSAGE (156 characters • 1 SMS credit • No brackets)
const message = "Hi, Ishmael here. We're hosting a Free Live Online Build Workshop in Sept for non-coders in Ghana. Reserve your free spot: senaacademy.org/waitlist?src=sms";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchCustomBatch(batchType) {
  let batchFile = '';
  let batchLabel = '';

  if (batchType === 'batch3') {
    batchFile = path.join(__dirname, 'batch-3-contacts.json');
    batchLabel = 'WEDNESDAY BATCH #3 (1,557 Contacts)';
  } else if (batchType === 'batch1_resend') {
    batchFile = path.join(__dirname, 'batch-1-non-signups.json');
    batchLabel = 'BATCH #1 NON-SIGNUPS RETARGET (1,773 Contacts)';
  } else {
    console.error('Usage: node scratch/send-custom-sms-batch.js [batch3 | batch1_resend]');
    process.exit(1);
  }

  if (!fs.existsSync(batchFile)) {
    console.error(`File not found: ${batchFile}`);
    process.exit(1);
  }

  const recipients = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  console.log(`\n========================================`);
  console.log(`🚀 LAUNCHING SMS BROADCAST: ${batchLabel}`);
  console.log(`Total Recipients: ${recipients.length}`);
  console.log(`Sender ID: ${senderId}`);
  console.log(`Character Count: ${message.length} chars (GSM-7 Single SMS Page)`);
  console.log(`Exact Message Text:\n"${message}"`);
  console.log(`========================================\n`);

  const chunkSize = 50;
  let sentCount = 0;
  let errorCount = 0;
  const totalChunks = Math.ceil(recipients.length / chunkSize);

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;

    console.log(`[${new Date().toLocaleTimeString()}] 📦 Dispatching Chunk ${chunkIndex}/${totalChunks} (${chunk.length} recipients)...`);

    try {
      const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderId,
          message: message,
          recipients: chunk,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        sentCount += chunk.length;
        console.log(`   ✅ Chunk ${chunkIndex} sent successfully (${sentCount}/${recipients.length})`);
      } else {
        console.error(`   ❌ Chunk ${chunkIndex} error:`, data);
        errorCount += chunk.length;
      }
    } catch (err) {
      console.error(`   ❌ Chunk ${chunkIndex} network error:`, err.message);
      errorCount += chunk.length;
    }

    if (i + chunkSize < recipients.length) {
      await sleep(30000); // 30s throttle between chunks
    }
  }

  console.log(`\n========================================`);
  console.log(`🏁 BROADCAST COMPLETE: ${batchLabel}`);
  console.log(`Total Sent: ${sentCount}`);
  console.log(`Total Errors: ${errorCount}`);
  console.log(`========================================\n`);
}

const arg = process.argv[2] || 'batch3';
dispatchCustomBatch(arg).catch(err => console.error(err));
