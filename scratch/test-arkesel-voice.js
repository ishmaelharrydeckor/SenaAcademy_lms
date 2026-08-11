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
if (!arkeselApiKey) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

async function sendArkeselVoice() {
  const testPhone = '233594607904';
  console.log(`Sending Arkesel Voice call to ${testPhone}...`);
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/voice/send', {
      method: 'POST',
      headers: {
        'api-key': arkeselApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: [testPhone],
        message: 'This is a test voice call from Sena Academy. We are testing your line connectivity. Thank you.'
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    const data = await response.json();
    console.log('Arkesel API Status:', response.status);
    console.log('Arkesel API Response:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

sendArkeselVoice();
