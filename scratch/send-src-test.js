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
const senderId = 'FORSTEL4SRC';
const testPhone = '233555908380';

if (!arkeselApiKey) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

const messageText = `Thank you for voting for FORSTELL EHUN and ABDUL SALAM. Your support brings us one step closer to the SRC we deserve.
FORSTELL EHUN-SRC PRESIDENT HOPEFUL
#7`;

async function sendTest() {
  console.log(`Sending campaign test SMS to ${testPhone} using Sender ID: ${senderId}...`);
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
        recipients: [testPhone]
      }),
      signal: AbortSignal.timeout(45000)
    });

    const data = await response.json();
    console.log('Arkesel API Status:', response.status);
    console.log('Arkesel API Response:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

sendTest();
