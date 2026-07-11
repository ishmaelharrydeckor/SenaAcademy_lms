const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('cohorts').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Connection successful! Cohort count:', data);
  }
}

run();
