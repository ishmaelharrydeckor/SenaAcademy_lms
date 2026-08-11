const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  console.log('Querying table structures from Supabase RPC...');
  // We can query a single row from event_registrations and event_waitlist to see all keys
  const { data: reg, error: err1 } = await supabase.from('event_registrations').select('*').limit(1);
  const { data: wait, error: err2 } = await supabase.from('event_waitlist').select('*').limit(1);

  if (err1) console.error('Error event_registrations:', err1.message);
  else console.log('event_registrations Keys:', reg.length > 0 ? Object.keys(reg[0]) : 'Empty table');

  if (err2) console.error('Error event_waitlist:', err2.message);
  else console.log('event_waitlist Keys:', wait.length > 0 ? Object.keys(wait[0]) : 'Empty table');
}

checkColumns().catch(console.error);
