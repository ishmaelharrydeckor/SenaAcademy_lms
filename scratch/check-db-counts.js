const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
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
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Query event_waitlist
  const { data: waitlist, error: wError, count: wCount } = await supabase
    .from('event_waitlist')
    .select('*', { count: 'exact' });

  if (wError) {
    console.error('event_waitlist query error:', wError);
  } else {
    console.log('event_waitlist count:', wCount || waitlist.length);
    if (waitlist.length > 0) {
      console.log('event_waitlist sample:', waitlist[0]);
    }
  }

  // Query event_registrations
  const { data: registrations, error: rError, count: rCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact' });

  if (rError) {
    console.error('event_registrations query error:', rError);
  } else {
    console.log('event_registrations count:', rCount || registrations.length);
    if (registrations.length > 0) {
      console.log('event_registrations sample:', registrations[0]);
    }
  }
}

run();
