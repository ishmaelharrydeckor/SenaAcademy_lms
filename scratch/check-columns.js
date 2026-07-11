const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumn(col) {
  const { data, error } = await supabase.from('access_codes').select(col).limit(1);
  if (error) {
    console.log(`Column '${col}': ERROR: ${error.message}`);
  } else {
    console.log(`Column '${col}': EXISTS`);
  }
}

async function run() {
  const columns = ['redeemed_by'];
  await checkColumn('redeemed_by');
}

run();
