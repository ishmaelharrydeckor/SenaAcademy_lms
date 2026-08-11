const apiKey = 'V29iZWp4dW1DRkZoVklTRWNzbmQ';

async function testEndpoint(url, name) {
  try {
    const res = await fetch(url, { headers: { 'api-key': apiKey } });
    const text = await res.text();
    console.log(`${name} Status:`, res.status);
    console.log(`${name} Text:`, text.slice(0, 500));
  } catch (err) {
    console.error(`${name} Error:`, err.message);
  }
}

async function run() {
  await testEndpoint('https://sms.arkesel.com/api/v2/clients/balance', 'Clients Balance');
  await testEndpoint('https://sms.arkesel.com/api/v2/user/balance', 'User Balance');
  await testEndpoint('https://sms.arkesel.com/api/v2/profile', 'Profile');
}

run();
