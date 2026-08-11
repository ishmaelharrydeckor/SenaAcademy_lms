const apiKey = 'pBYuxG4wFronfEqmbCy97xaWB';

async function fetchTemplates() {
  const url = `https://api.mnotify.com/api/template?key=${apiKey}`;
  console.log(`Fetching BMS templates from: ${url}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('JSON Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

fetchTemplates();
