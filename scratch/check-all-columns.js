const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const schema = {
  cohorts: ['id', 'name', 'created_at'],
  profiles: ['id', 'email', 'full_name', 'role', 'cohort_id', 'created_at'],
  access_codes: ['id', 'code', 'assigned_email', 'cohort_id', 'role', 'status', 'expires_at', 'created_at', 'redeemed_at', 'redeemed_by'],
  modules: ['id', 'module_number', 'title', 'description', 'learning_outcomes', 'objectives', 'resources', 'is_visible', 'unlock_date', 'created_at'],
  submissions: [
    'id', 'module_id', 'student_id', 'submission_date', 'zip_file_url', 'pdf_file_url',
    'github_url', 'vercel_url', 'drive_url', 'comments', 'status', 'score', 'feedback_json', 'draft_feedback_json', 'created_at'
  ],
  announcements: ['id', 'title', 'content', 'cohort_id', 'created_by', 'created_at'],
  notifications: ['id', 'user_id', 'title', 'message', 'link', 'is_read', 'created_at'],
  payments: ['id', 'email', 'full_name', 'cohort_id', 'paystack_reference', 'amount', 'currency', 'status', 'access_code_generated', 'created_at'],
  events: [
    'id', 'title', 'slug', 'description', 'cover_image_url', 'event_type', 'location',
    'meeting_link', 'start_time', 'end_time', 'is_paid', 'price', 'currency', 'capacity', 'status', 'created_by', 'created_at'
  ],
  event_registrations: [
    'id', 'event_id', 'full_name', 'email', 'payment_status', 'paystack_reference', 'checked_in', 'created_at'
  ]
};

async function checkTableColumns(table, columns) {
  console.log(`\nChecking table: ${table}...`);
  for (const col of columns) {
    const { error } = await supabase.from(table).select(col).limit(1);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log(`❌ Column '${col}': MISSING`);
      } else {
        console.log(`⚠️ Column '${col}': Error (${error.message})`);
      }
    } else {
      console.log(`✅ Column '${col}': EXISTS`);
    }
  }
}

async function run() {
  for (const [table, columns] of Object.entries(schema)) {
    try {
      await checkTableColumns(table, columns);
    } catch (err) {
      console.error(`Failed checking table ${table}:`, err.message);
    }
  }
}

run();
