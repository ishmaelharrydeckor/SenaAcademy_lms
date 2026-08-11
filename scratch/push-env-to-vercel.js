const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

// 2. Parse variables
const vars = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return; // Skip comments and empty lines
  
  const index = trimmed.indexOf('=');
  if (index === -1) return;
  
  const key = trimmed.substring(0, index).trim();
  const val = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, ''); // strip optional quotes
  
  if (key) {
    vars[key] = val;
  }
});

// 3. Upload each variable to Vercel
console.log('Uploading environment variables to Vercel...');
for (const [key, val] of Object.entries(vars)) {
  console.log(`Uploading ${key}...`);
  try {
    // Run Vercel CLI command to add/overwrite env variable
    const cmd = `npx vercel env add ${key} production,preview --value "${val.replace(/"/g, '\\"')}" --force --yes`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Successfully uploaded ${key}`);
  } catch (err) {
    console.error(`❌ Failed to upload ${key}:`, err.message);
  }
}

console.log('🎉 Done uploading environment variables!');
