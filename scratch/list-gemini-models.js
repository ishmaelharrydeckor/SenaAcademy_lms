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

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log('Querying available models from:', url.substring(0, 80) + '...');
  try {
    const response = await fetch(url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    if (data.models) {
      console.log('Available models found:');
      data.models.forEach(m => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('No models returned. Full response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error fetching models:', err.message);
  }
}

listModels();
