const phone = '233555908380';
const message = 'Arkesel connection test';

const key1 = 'WobejxumCFFhVISEcsnd'; // Decoded Base64
const key2 = 'V29iZWp4dW1DRkZoVklTRWNzbmQ'; // Raw input string

async function checkKey(key, name) {
  console.log(`Checking ${name}: "${key}"...`);
  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: 'Arkesel',
        message: message,
        recipients: [phone]
      })
    });

    const data = await response.json();
    console.log(`Response for ${name}:`, data);
  } catch (err) {
    console.error(`Error for ${name}:`, err.message);
  }
}

async function run() {
  await checkKey(key2, 'Raw key with SENA Sender ID');
}

run();
