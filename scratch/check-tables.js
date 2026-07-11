const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Checking if events table exists...');
  const { data, error } = await supabase.from('events').select('*').limit(1);
  if (error) {
    console.log('Events table error (likely does not exist yet):', error.message);
  } else {
    console.log('Events table exists! Sample data:', data);
  }

  console.log('Checking if event_registrations table exists...');
  const { data: regData, error: regError } = await supabase.from('event_registrations').select('*').limit(1);
  if (regError) {
    console.log('Event registrations table error:', regError.message);
  } else {
    console.log('Event registrations table exists!');
  }
}

run();
