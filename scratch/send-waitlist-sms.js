const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const arkeselKeyMatch = envContent.match(/ARKESEL_API_KEY\s*=\s*(.*)/);
const arkeselSenderMatch = envContent.match(/ARKESEL_SENDER_ID\s*=\s*(.*)/);

const apiKey = arkeselKeyMatch ? arkeselKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
const senderId = arkeselSenderMatch ? arkeselSenderMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'SenaAcademy';

if (!apiKey) {
  console.error('ARKESEL_API_KEY not found in .env.local');
  process.exit(1);
}

const recipients = [
  { name: 'Innocentia', rawPhone: '0538087427' },
  { name: 'Herbert', rawPhone: '+233 20 384 5176' },
  { name: 'Augustine', rawPhone: '0597285228' },
  { name: 'Dennis', rawPhone: '0595906340' },
  { name: 'Michael', rawPhone: '0242679643' },
  { name: 'Ishmael', rawPhone: '0555908380' } // Your number for live test verification
];

function normalizePhone(phone) {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  } else if (cleaned.startsWith('233')) {
    // already 233
  } else if (cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  return cleaned;
}

const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';

async function sendSms() {
  console.log(`Sending SMS using Arkesel (Sender ID: ${senderId})...\n`);

  for (const r of recipients) {
    const formattedPhone = normalizePhone(r.rawPhone);
    const message = `Hi ${r.name}, thanks for joining the waitlist for Sena Academy's free September live build session! Join our WhatsApp community here for live workshop updates and free code templates: ${whatsappLink} - Ishmael`;

    console.log(`Sending to ${r.name} (${formattedPhone})...`);

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
          recipients: [formattedPhone],
        }),
      });

      const data = await response.json();
      console.log(`Response for ${r.name}:`, JSON.stringify(data));
    } catch (err) {
      console.error(`Failed to send to ${r.name}:`, err.message);
    }
  }
  console.log('\nAll SMS messages processed!');
}

sendSms();
