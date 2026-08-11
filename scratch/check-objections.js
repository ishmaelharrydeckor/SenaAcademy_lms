const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse env keys
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const firstEq = line.indexOf('=');
    const key = line.substring(0, firstEq).trim();
    const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
    process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkObjections() {
  try {
    const { data, count, error } = await supabase
      .from('marketing_objections')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error fetching objections:', error.message);
      return;
    }

    console.log('Total Objections in Database:', count || data.length);
    if (data.length > 0) {
      console.log('\nList of Objections:');
      data.forEach(obj => {
        console.log(`- [Category: ${obj.category}] "${obj.objection_text}" (Count: ${obj.frequency_count})`);
      });
    } else {
      console.log('The objections table is currently empty.');
    }
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}

checkObjections();
