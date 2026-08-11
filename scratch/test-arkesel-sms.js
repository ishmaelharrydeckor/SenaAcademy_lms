const apiKey = 'V29iZWp4dW1DRkZoVklTRWNzbmQ';

async function testSend() {
  console.log('Sending test SMS via Arkesel...');
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: 'SENA',
        message: 'Test message',
        recipients: ['233555908380']
      })
    });
    const data = await response.json();
    console.log('Arkesel Status:', response.status);
    console.log('Arkesel Response:', data);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testSend();
