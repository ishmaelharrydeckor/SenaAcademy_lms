const apiKey = 'pBYuxG4wFronfEqmbCy97xaWB';

async function testEndpoint(url, name) {
  console.log(`\nTesting ${name}: ${url}...`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2).slice(0, 1000));
  } catch (err) {
    console.error(`Error for ${name}:`, err.message);
  }
}

async function run() {
  const endpoints = [
    { name: 'Voice Media', url: `https://api.mnotify.com/api/voice/media?key=${apiKey}` },
    { name: 'Voice Files', url: `https://api.mnotify.com/api/voice/files?key=${apiKey}` },
    { name: 'Voice Templates', url: `https://api.mnotify.com/api/voice/templates?key=${apiKey}` },
    { name: 'Voice List', url: `https://api.mnotify.com/api/voice/list?key=${apiKey}` },
    { name: 'General Profile', url: `https://api.mnotify.com/api/profile?key=${apiKey}` }
  ];

  for (const ep of endpoints) {
    await testEndpoint(ep.url, ep.name);
  }
}

run();
