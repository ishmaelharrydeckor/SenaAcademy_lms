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

async function search() {
  console.log('Searching for Amos Nyarko in payments table...');
  const { data: byAmos, error: err1 } = await supabase
    .from('payments')
    .select('email, full_name, status, amount, created_at')
    .ilike('full_name', '%Amos%');
  
  const { data: byNyarko, error: err2 } = await supabase
    .from('payments')
    .select('email, full_name, status, amount, created_at')
    .ilike('full_name', '%Nyarko%');

  console.log('--- Search Results by "Amos" ---');
  console.log(byAmos);

  console.log('\n--- Search Results by "Nyarko" ---');
  console.log(byNyarko);
}

search().catch(console.error);
