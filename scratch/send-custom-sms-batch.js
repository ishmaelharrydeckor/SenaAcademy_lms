const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

// HORMOZI OUTCOME-FIRST MESSAGE — Version 4 (143 chars • Single SMS page • Waitlist destination)
const message = "Local businesses in Ghana pay GHS 900-2,500 for websites. Free workshop: build one with AI in 60 mins. No coding. 30 spots. September: https://bit.ly/4g3aydK";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchCustomBatch(batchType) {
  let batchFile = '';
  let batchLabel = '';

  let sliceRange = null;

  if (batchType === 'batch3') {
    batchFile = path.join(__dirname, 'batch-3-contacts.json');
    batchLabel = 'BATCH #3 — Hormozi Retarget (Waitlist)';
  } else if (batchType === 'batch4_morning') {
    batchFile = path.join(__dirname, 'batch-4-contacts.json');
    sliceRange = [0, 778];
    batchLabel = 'BATCH #4 MORNING (Part 1 of 2: 778 Contacts → Waitlist)';
  } else if (batchType === 'batch4_evening') {
    batchFile = path.join(__dirname, 'batch-4-contacts.json');
    sliceRange = [778];
    batchLabel = 'BATCH #4 EVENING (Part 2 of 2: 779 Contacts → Waitlist)';
  } else if (batchType === 'batch4') {
    batchFile = path.join(__dirname, 'batch-4-contacts.json');
    batchLabel = 'BATCH #4 FULL (1,557 Contacts → Waitlist)';
  } else if (batchType === 'batch5_morning') {
    batchFile = path.join(__dirname, 'batch-5-contacts.json');
    sliceRange = [0, 778];
    batchLabel = 'BATCH #5 MORNING (Part 1 of 2: 778 Contacts → Waitlist)';
  } else if (batchType === 'batch5_evening') {
    batchFile = path.join(__dirname, 'batch-5-contacts.json');
    sliceRange = [778];
    batchLabel = 'BATCH #5 EVENING (Part 2 of 2: 779 Contacts → Waitlist)';
  } else if (batchType === 'batch5') {
    batchFile = path.join(__dirname, 'batch-5-contacts.json');
    batchLabel = 'BATCH #5 FULL (1,557 Contacts → Waitlist)';
  } else if (batchType === 'batch1_resend') {
    batchFile = path.join(__dirname, 'batch-1-non-signups.json');
    batchLabel = 'BATCH #1 NON-SIGNUPS RETARGET (1,773 Contacts → Waitlist)';
  } else {
    console.error('Usage: node scratch/send-custom-sms-batch.js [batch4_morning | batch4_evening | batch4 | batch5_morning | batch5_evening | batch5 | batch1_resend]');
    process.exit(1);
  }

  if (!fs.existsSync(batchFile)) {
    console.error(`File not found: ${batchFile}`);
    process.exit(1);
  }

  let recipients = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  if (sliceRange) {
    recipients = sliceRange.length === 2 ? recipients.slice(sliceRange[0], sliceRange[1]) : recipients.slice(sliceRange[0]);
  }
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

const arg = process.argv[2];
if (!arg) {
  console.log('Usage: node scratch/send-custom-sms-batch.js <batch4_morning | batch4_evening | batch4 | batch5_morning | batch5_evening | batch5 | batch1_resend>');
  process.exit(0);
}
dispatchCustomBatch(arg).catch(err => console.error(err));
