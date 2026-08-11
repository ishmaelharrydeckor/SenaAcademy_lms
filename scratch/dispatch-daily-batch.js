const fs = require('fs');
const path = require('path');

const batchNumber = process.argv[2] || '2';

const batchConfigs = {
  '2': {
    file: 'batch-2-contacts.json',
    name: 'Batch 2 (Tuesday) - No-Code Curiosity Hook',
    message: "Want to build apps in Ghana without learning to code? Join our Free Sept Live Online Workshop + get our Free AI Guide. Reserve spot: senaacademy.org/waitlist?src=sms"
  },
  '3': {
    file: 'batch-3-contacts.json',
    name: 'Batch 3 (Wednesday) - Direct Founder Invitation',
    message: "Hi, it's Ishmael. Join our free Sept live online workshop: build real web apps with AI (zero coding). Free spot & guide: senaacademy.org/waitlist?src=sms"
  },
  '4': {
    file: 'batch-4-contacts.json',
    name: 'Batch 4 (Thursday) - High-Income 48-Hour Speed Hook',
    message: "Learn how non-coders in Ghana build web apps in 48hrs with AI. Free Sept Live Online Workshop + Free AI Guide. Grab seat: senaacademy.org/waitlist?src=sms - Sena"
  },
  '5': {
    file: 'batch-5-contacts.json',
    name: 'Batch 5 (Friday) - Free AI Prompt Guide Lead Magnet',
    message: "I just released \"The Non-Coder Guide to AI\" in Ghana. Free PDF download + Free Sept live build workshop. Grab yours: senaacademy.org/waitlist?src=sms - Ishmael"
  }
};

const config = batchConfigs[batchNumber];
if (!config) {
  console.error(`Invalid batch number: ${batchNumber}. Choose 2, 3, 4, or 5.`);
  process.exit(1);
}

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

const batchFile = path.join(__dirname, config.file);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchBatch() {
  if (!fs.existsSync(batchFile)) {
    console.error(`Batch file not found: ${batchFile}`);
    return;
  }

  const recipients = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  console.log(`\n========================================`);
  console.log(`🚀 STARTING ${config.name.toUpperCase()}`);
  console.log(`Total Recipients: ${recipients.length}`);
  console.log(`Sender ID: ${senderId}`);
  console.log(`Batch Size: 50 contacts every 30 seconds`);
  console.log(`Message (${config.message.length} chars):\n"${config.message}"`);
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
          message: config.message,
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
      await sleep(30000); // 30s delay between micro-batches
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ${config.name} COMPLETED!`);
  console.log(`✅ Successfully Sent: ${sentCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`========================================\n`);
}

dispatchBatch();
