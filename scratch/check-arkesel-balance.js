const apiKey = 'V29iZWp4dW1DRkZoVklTRWNzbmQ';

async function testEndpoint(url, name) {
  try {
    const res = await fetch(url, { headers: { 'api-key': apiKey } });
    const data = await res.json();
    console.log(`${name} Response:`, data);
  } catch (err) {
    console.error(`${name} Error:`, err.message);
  }
}

async function run() {
  await testEndpoint('https://sms.arkesel.com/api/v2/balance', 'Endpoint 1');
  await testEndpoint('https://sms.arkesel.com/api/v2/sms/balance', 'Endpoint 2');
}

run();
