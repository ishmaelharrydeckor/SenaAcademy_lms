const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const client = createClient(url, key);

async function checkPaid() {
  console.log('Fetching paid students in Cohort 1...');
  
  // Check payments table
  const { data: payments } = await client
    .from('payments')
    .select('email, status, amount');

  // Check profiles / cohort_students table if exists
  const { data: profiles } = await client
    .from('profiles')
    .select('email, role');

  console.log('Payments count:', payments?.length || 0);
  console.log('Payments sample:', payments);
  console.log('Profiles count:', profiles?.length || 0);
}

checkPaid();
