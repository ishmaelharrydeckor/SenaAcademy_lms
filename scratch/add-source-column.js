const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

const client = createClient(url, key);

async function tryInsertWithSource() {
  // Check if inserting with source column works
  const { data, error } = await client
    .from('event_waitlist')
    .insert({
      event_id: '86429598-a734-4b53-90d5-7145e7f09da9',
      full_name: 'Source Test User',
      email: 'test-source-check@senaacademy.org',
      phone: '0550000000',
      source: 'tiktok'
    })
    .select();

  if (error) {
    console.log('Source column exists status:', error.message);
  } else {
    console.log('✅ Source column is already present and works!', data);
    // Cleanup test record
    await client.from('event_waitlist').delete().eq('email', 'test-source-check@senaacademy.org');
  }
}

tryInsertWithSource();
