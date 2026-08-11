const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await client
    .from('event_waitlist')
    .select('*')
    .eq('email', 'test-live-success@sena.org')
    .maybeSingle();

  if (error) {
    console.error('Error fetching record:', error.message);
  } else if (!data) {
    console.log('Record not found.');
  } else {
    console.log('Found waitlist entry:');
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
