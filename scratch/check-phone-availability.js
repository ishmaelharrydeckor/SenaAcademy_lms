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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Fetching event registrants and checking phone number availability...');

  // 1. Get all event registrants
  const { data: registrants, error: rErr } = await supabase
    .from('event_registrations')
    .select('full_name, email');

  if (rErr) {
    console.error('Error fetching registrations:', rErr);
    process.exit(1);
  }

  // 2. Get all waitlist contacts (both from DB and local file)
  const { data: waitlist, error: wErr } = await supabase
    .from('event_waitlist')
    .select('email, phone');

  if (wErr) {
    console.error('Error fetching waitlist:', wErr);
    process.exit(1);
  }

  const waitlistPhonesByEmail = {};
  waitlist.forEach(w => {
    if (w.email && w.phone) {
      waitlistPhonesByEmail[w.email.toLowerCase().trim()] = w.phone;
    }
  });

  // Check profiles table for any phone numbers too
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('email, phone')
    .not('phone', 'is', null);

  if (!pErr && profiles) {
    profiles.forEach(p => {
      if (p.email && p.phone) {
        waitlistPhonesByEmail[p.email.toLowerCase().trim()] = p.phone;
      }
    });
  }

  // 3. Match and count
  let matchedCount = 0;
  const matchedList = [];
  const unmatchedList = [];

  registrants.forEach(r => {
    const emailLower = r.email.toLowerCase().trim();
    const phone = waitlistPhonesByEmail[emailLower];
    if (phone) {
      matchedCount++;
      matchedList.push({ name: r.full_name, email: r.email, phone: phone });
    } else {
      unmatchedList.push({ name: r.full_name, email: r.email });
    }
  });

  console.log('====================================================');
  console.log(`Total Event Registrants: ${registrants.length}`);
  console.log(`Matched (We HAVE their phone numbers): ${matchedCount}`);
  console.log(`Unmatched (We ONLY have their emails): ${registrants.length - matchedCount}`);
  console.log('====================================================');
  
  if (matchedList.length > 0) {
    console.log('\nSample of matched registrants:');
    console.log(matchedList.slice(0, 3));
  }
}

run();
