const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const client = createClient(url, key);

async function checkWaitlist() {
  console.log('Querying event_waitlist table...');
  const { data, error } = await client
    .from('event_waitlist')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching waitlist:', error.message);
  } else {
    console.log(`Total waitlist signups: ${data.length}`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkWaitlist();
