const fs = require('fs');
const path = require('path');

const targetTime = new Date('2026-08-11T08:00:00Z'); // Tuesday, August 11 @ 8:00 AM GMT
const batchFile = path.join(__dirname, 'batch-2-contacts.json');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

const message = "Want to build apps in Ghana without learning to code? Join our Free Sept Live Online Workshop + get our Free AI Guide. Reserve spot: senaacademy.org/waitlist?src=sms";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchBatch2() {
  const recipients = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  console.log(`\n========================================`);
  console.log(`🚀 [8:00 AM GMT] LAUNCHING TUESDAY BATCH #2 SMS BROADCAST`);
  console.log(`Total Recipients: ${recipients.length}`);
  console.log(`Sender ID: ${senderId}`);
  console.log(`Batch Size: 50 contacts every 30 seconds`);
  console.log(`Message (${message.length} chars): "${message}"`);
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
        console.log(`✅ Chunk ${chunkIndex} sent successfully! Total sent: ${sentCount}/${recipients.length}`);
      } else {
        errorCount += chunk.length;
        console.log(`⚠️ Chunk ${chunkIndex} warning:`, JSON.stringify(data));
      }
    } catch (err) {
      errorCount += chunk.length;
      console.error(`❌ Chunk ${chunkIndex} error:`, err.message);
    }

    if (i + chunkSize < recipients.length) {
      await sleep(30000); // 30s delay between batches
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 TUESDAY BATCH #2 BROADCAST COMPLETED!`);
  console.log(`✅ Successfully Sent: ${sentCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`========================================\n`);
}

async function startDaemon() {
  console.log(`\n========================================`);
  console.log(`⏰ BATCH #2 AUTOMATED SMS SCHEDULER ARMED`);
  console.log(`Target Time: ${targetTime.toUTCString()}`);
  console.log(`Target Batch: 1,557 contacts (Hook A: No-Code Curiosity)`);
  console.log(`========================================\n`);

  while (true) {
    const now = new Date();
    if (now >= targetTime) {
      await dispatchBatch2();
      break;
    }

    const remainingMinutes = Math.round((targetTime - now) / 60000);
    console.log(`[${now.toISOString()}] ⏳ SMS Batch #2 armed for 8:00 AM GMT tomorrow (~${remainingMinutes} minutes remaining).`);
    await sleep(60000); // Check every minute
  }
}

startDaemon();
