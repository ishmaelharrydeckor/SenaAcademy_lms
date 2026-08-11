const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';

async function checkReport() {
  console.log('Fetching mNotify voice campaign reports...');
  try {
    const url = `https://api.mnotify.com/api/voice/report?key=${mnotifyApiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkReport();
