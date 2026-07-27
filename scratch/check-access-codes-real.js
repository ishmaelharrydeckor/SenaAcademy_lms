const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Querying payments table...');
  const { data: payments, error: payErr } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log('Payments Error:', payErr);
  console.log('Recent Payments:', payments);

  console.log('\nQuerying access_codes table...');
  const { data: codes, error: codeErr } = await supabase
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('Access Codes Error:', codeErr);
  console.log('Recent Access Codes:', codes);
}

run();
