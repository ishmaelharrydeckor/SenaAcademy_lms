const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const client = createClient(url, key);

async function cleanTestUsers() {
  const { data, error } = await client
    .from('event_waitlist')
    .delete()
    .ilike('email', '%test@senaacademy.org%')
    .select();

  console.log('Cleaned test users:', data?.length);
}

cleanTestUsers();
