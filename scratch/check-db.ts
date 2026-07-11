import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseServiceRole = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') supabaseServiceRole = value;
    }
  });
}

if (!supabaseUrl || !supabaseServiceRole || supabaseServiceRole === 'your_supabase_service_role_key') {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing or invalid in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

async function checkDatabase() {
  console.log('--- Database Diagnostics ---');
  
  // 1. Fetch Cohorts
  const { data: cohorts, error: cohortErr } = await supabaseAdmin.from('cohorts').select('id, name');
  if (cohortErr) {
    console.error('Error fetching cohorts:', cohortErr);
  } else {
    console.log('\nCohorts:');
    console.table(cohorts);
  }

  // 2. Fetch Access Codes
  const { data: codes, error: codeErr } = await supabaseAdmin.from('access_codes').select('code, assigned_email, cohort_id, status');
  if (codeErr) {
    console.error('Error fetching access codes:', codeErr);
  } else {
    console.log('\nAccess Codes:');
    console.table(codes);
  }

  // 3. Fetch Profiles
  const { data: profiles, error: profileErr } = await supabaseAdmin.from('profiles').select('id, email, full_name, role, cohort_id');
  if (profileErr) {
    console.error('Error fetching profiles:', profileErr);
  } else {
    console.log('\nProfiles:');
    console.table(profiles);
  }

  // 4. Fetch Users in Auth
  const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
  if (authErr) {
    console.error('Error listing auth users:', authErr);
  } else {
    console.log('\nAuth Users:');
    const userTable = authUsers.users.map(u => ({ id: u.id, email: u.email, confirmed: u.email_confirmed_at ? 'Yes' : 'No' }));
    console.table(userTable);
  }
}

checkDatabase().catch(console.error);
