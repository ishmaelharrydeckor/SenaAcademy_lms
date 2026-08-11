const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const keys = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

keys.forEach(k => {
  const regex = new RegExp(`^${k}\\s*=\\s*(.*)$`, 'm');
  const match = envContent.match(regex);
  if (match) {
    const val = match[1].trim().replace(/^['"]|['"]$/g, '');
    console.log(`${k}="${val}"`);
  } else {
    console.log(`${k}=NOT_FOUND`);
  }
});
