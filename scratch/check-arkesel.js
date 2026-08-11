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

async function testEndpoint(url, name) {
  try {
    const res = await fetch(url, { headers: { 'api-key': key } });
    const text = await res.text();
    console.log(`${name} Status:`, res.status);
    console.log(`${name} Response:`, text);
  } catch (err) {
    console.error(`${name} Error:`, err.message);
  }
}

async function run() {
  await testEndpoint('https://sms.arkesel.com/api/v2/clients/balance', 'Clients Balance');
  await testEndpoint('https://sms.arkesel.com/api/v2/user/balance', 'User Balance');
  await testEndpoint('https://sms.arkesel.com/api/v2/sms/balance', 'SMS Balance');
  await testEndpoint('https://sms.arkesel.com/api/v2/balance', 'Generic Balance');
}

run();
