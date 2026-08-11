const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, '');
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)?.[1]?.trim().replace(/^['"]|['"]$/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) {
    return '0' + digits.slice(3);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits;
  }
  return digits;
}

async function prepareBatch1Resend() {
  console.log('Querying existing signups from database...');
  
  // 1. Fetch all signed up phones from event_waitlist & users
  const { data: waitlist, error: wErr } = await supabase.from('event_waitlist').select('phone');
  const { data: users, error: uErr } = await supabase.from('users').select('phone');

  const signedUpPhones = new Set();
  (waitlist || []).forEach(r => {
    const norm = normalizePhone(r.phone);
    if (norm) signedUpPhones.add(norm);
  });
  (users || []).forEach(r => {
    const norm = normalizePhone(r.phone);
    if (norm) signedUpPhones.add(norm);
  });

  console.log(`Total signed up phone numbers in database: ${signedUpPhones.size}`);

  // 2. Load Batch 1 contacts (1,812)
  const batch1Path = path.join(__dirname, 'batch-1812-contacts.json');
  const batch1Contacts = JSON.parse(fs.readFileSync(batch1Path, 'utf8'));
  console.log(`Total contacts in Batch 1: ${batch1Contacts.length}`);

  // 3. Filter out anyone who already signed up
  const nonSignups = batch1Contacts.filter(phone => {
    const norm = normalizePhone(phone);
    return !signedUpPhones.has(norm);
  });

  console.log(`\nFiltered Batch 1 Non-Signups: ${nonSignups.length} contacts (Excluded ${batch1Contacts.length - nonSignups.length} existing signups)`);

  const outputPath = path.join(__dirname, 'batch-1-non-signups.json');
  fs.writeFileSync(outputPath, JSON.stringify(nonSignups, null, 2));
  console.log(`✅ Saved to ${outputPath}`);
}

prepareBatch1Resend().catch(err => console.error(err));
