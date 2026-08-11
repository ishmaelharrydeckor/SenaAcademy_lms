const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Error] Missing Supabase config in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const cohortId = 'e8aa03c6-3cd1-4069-9315-fea19a0da580'; // Founding Builders

async function revertPrice() {
  console.log('=============================================');
  console.log('       REVERTING COHORT PRICE TO GHS 100');
  console.log('=============================================');

  // 1. Update Database Price
  try {
    console.log('Reverting cohort price in Supabase database...');
    const { error } = await supabase
      .from('cohorts')
      .update({ price: 100 })
      .eq('id', cohortId);

    if (error) throw error;
    console.log('[+] Database price successfully reverted to GHS 100!');
  } catch (err) {
    console.error('[-] Database update failed:', err.message);
  }

  // 2. Update Frontend Code
  const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
  if (fs.existsSync(pagePath)) {
    try {
      console.log('Reverting homepage GHS 200 price back to GHS 100 on disk...');
      let content = fs.readFileSync(pagePath, 'utf8');
      
      const targetStr = '<span className="text-2xl font-black text-text-primary font-mono">GHS 200</span>';
      const replacementStr = '<span className="text-2xl font-black text-text-primary font-mono">GHS 100</span>';
      
      if (content.includes(targetStr)) {
        content = content.replace(targetStr, replacementStr);
        fs.writeFileSync(pagePath, content, 'utf8');
        console.log('[+] Frontend file updated on disk.');
        
        // 3. Commit and push to Git
        console.log('Staging and pushing changes to GitHub...');
        execSync('git add src/app/page.tsx', { stdio: 'inherit' });
        execSync('git commit -m "chore: temporarily revert pricing to GHS 100 discount extension"', { stdio: 'inherit' });
        execSync('git push origin staging', { stdio: 'inherit' });
        execSync('git checkout main', { stdio: 'inherit' });
        execSync('git merge staging', { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        execSync('git checkout staging', { stdio: 'inherit' });
        console.log('[+] Push successful. Vercel deployment triggered!');
      } else {
        console.warn('[Warning] Target price string GHS 200 not found in src/app/page.tsx. Skipping code push.');
      }
    } catch (err) {
      console.error('[-] Frontend file update/push failed:', err.message);
    }
  } else {
    console.error('[-] Error: src/app/page.tsx not found on disk.');
  }

  console.log('Price reversion task finished.');
}

revertPrice().catch(console.error);
