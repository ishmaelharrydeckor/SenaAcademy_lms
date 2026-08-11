const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? supabaseServiceKey.substring(0, 15) + '...' : 'Not found');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
  console.log('Testing Supabase upsert...');
  try {
    const { data, error } = await supabase
      .from('marketing_tiktok_research')
      .upsert({
        url: 'https://test-url-12345.com',
        title: 'Test Video',
        transcript: 'Test transcript content',
        status: 'pending'
      }, { onConflict: 'url' })
      .select();

    if (error) {
      console.error('Supabase DB Error:', error);
    } else {
      console.log('Supabase Upsert Successful! Result:', data);
    }
  } catch (err) {
    console.error('Detailed Error:');
    console.error(err);
    if (err.cause) {
      console.error('Cause:', err.cause);
    }
  }
}

testSupabase();
