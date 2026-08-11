const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const key = env.ARKESEL_API_KEY;
if (!key) {
  console.error('[Error] Missing ARKESEL_API_KEY in .env.local');
  process.exit(1);
}

async function checkBalance() {
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: 'FORSTEL4SRC',
        message: 'Balance check test',
        recipients: ['233544383466']
      }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await response.json();
    console.log('Arkesel API Status:', response.status);
    if (data.sms_balance !== undefined) {
      console.log('Current SMS Balance:', data.sms_balance);
    } else {
      console.log('Response Details:', data);
    }
  } catch (err) {
    console.error('Error querying balance:', err.message);
  }
}

checkBalance();
