const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';
const campaignId = '30B70653-66C7-4584-8031-A2056F6D8001';

async function checkDetails() {
  console.log(`Checking voice campaign status for ID: ${campaignId}...`);
  try {
    // We try the standard format: voice/report/{id}
    const url = `https://api.mnotify.com/api/voice/report/${campaignId}?key=${mnotifyApiKey}`;
    const response = await fetch(url);
    const text = await response.text();
    console.log('API Response Status:', response.status);
    console.log('API Response:', text.substring(0, 500));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDetails();
