const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const client = createClient(url, key);

async function run() {
  const { data, error } = await client
    .from('event_waitlist')
    .select('full_name, email, phone, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`TOTAL RECORDS: ${data.length}`);
  data.forEach((u, i) => {
    const d = new Date(u.created_at);
    console.log(`${i + 1}. [${d.toLocaleDateString('en-GB')}] ${u.full_name} | ${u.email} | ${u.phone}`);
  });
}

run();
