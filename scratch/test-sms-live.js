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
  console.error('No ARKESEL_API_KEY found');
  process.exit(1);
}

async function testSend() {
  console.log('Sending test SMS with active key...');
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: 'SENA',
        message: 'Sena Academy: Roster lock test.',
        recipients: ['233544383466'] // using a valid structure test number
      }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    console.log('Arkesel API Status:', response.status);
    console.log('Arkesel API Response:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testSend();
