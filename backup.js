const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Simple helper to parse .env.local file manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found in project root.');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

async function runBackup() {
  const env = loadEnv();
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key to bypass RLS policies if available, otherwise fallback to anon key
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and authentication keys are missing in .env.local.');
    process.exit(1);
  }

  console.log(`Initializing Supabase connection to: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tables = ['cohorts', 'profiles', 'access_codes', 'modules', 'submissions', 'announcements', 'notifications'];
  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  for (const table of tables) {
    console.log(`Backing up table: ${table}...`);
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Warning: Could not back up table "${table}". Reason: ${error.message}`);
        backupData.tables[table] = [];
      } else {
        backupData.tables[table] = data || [];
        console.log(`Saved ${data ? data.length : 0} rows from "${table}".`);
      }
    } catch (err) {
      console.warn(`Warning: Exception encountered during "${table}" backup:`, err.message);
      backupData.tables[table] = [];
    }
  }

  // Ensure backups directory exists
  const backupsDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupsDir, `backup_${timestampStr}.json`);
  
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log('\n==================================================');
  console.log(`Success! Backup written to: ${backupFilePath}`);
  console.log('Ensure you keep this file secure as it contains private student records.');
  console.log('==================================================');
}

runBackup();
