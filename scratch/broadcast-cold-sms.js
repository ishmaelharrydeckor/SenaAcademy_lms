const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

const message = "From GHS 0 in July to GHS 3,650 in 7 days building apps with AI. Free Sept live build workshop online. Reserve spot: senaacademy.org/waitlist?src=sms";

const batchFile = path.join(__dirname, 'batch-1812-contacts.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendBulkSms() {
  if (!fs.existsSync(batchFile)) {
    console.error('Batch file not found!');
    return;
  }

  const recipients = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
  console.log(`\n========================================`);
  console.log(`🚀 LAUNCHING COLD SMS BROADCAST`);
  console.log(`Total Recipients: ${recipients.length}`);
  console.log(`Sender ID: ${senderId}`);
  console.log(`Message (${message.length} chars): "${message}"`);
  console.log(`========================================\n`);

  const chunkSize = 50;
  let sentCount = 0;
  let errorCount = 0;

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;
    const totalChunks = Math.ceil(recipients.length / chunkSize);

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
        console.log(`[Batch ${chunkIndex}/${totalChunks}] ✅ Sent to ${chunk.length} recipients. Total sent: ${sentCount}`);
      } else {
        errorCount += chunk.length;
        console.log(`[Batch ${chunkIndex}/${totalChunks}] ⚠️ Failed:`, JSON.stringify(data));
      }
    } catch (err) {
      errorCount += chunk.length;
      console.error(`[Batch ${chunkIndex}/${totalChunks}] ❌ Network error:`, err.message);
    }

    await sleep(200); // 200ms delay between bulk chunks
  }

  console.log(`\n========================================`);
  console.log(`🎉 COLD SMS BROADCAST COMPLETED!`);
  console.log(`✅ Total Successfully Dispatched: ${sentCount}`);
  console.log(`❌ Total Failed: ${errorCount}`);
  console.log(`========================================\n`);
}

sendBulkSms();
