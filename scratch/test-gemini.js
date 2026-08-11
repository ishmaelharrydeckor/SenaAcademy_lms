const fs = require('fs');
const path = require('path');

// Parse env keys
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const firstEq = line.indexOf('=');
    const key = line.substring(0, firstEq).trim();
    const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
    process.env[key] = value;
  });
}

const apiKey = process.env.GEMINI_API_KEY;

async function testEndpoint(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`Testing model [${modelName}]...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Hello, respond with exactly "OK"' }] }]
      })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log('Response body:', text.substring(0, 500));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

async function runTests() {
  await testEndpoint('gemini-3.5-flash-lite');
  console.log('\n----------------------------------------\n');
  await testEndpoint('gemini-pro-latest');
  console.log('\n----------------------------------------\n');
  await testEndpoint('gemini-2.0-flash-lite');
  console.log('\n----------------------------------------\n');
  await testEndpoint('gemini-3.1-flash-lite');
}

runTests();
