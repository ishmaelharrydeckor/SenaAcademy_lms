const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  if (line.trim().startsWith('#') || !line.includes('=')) return;
  const firstEq = line.indexOf('=');
  const key = line.substring(0, firstEq).trim();
  const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
  process.env[key] = value;
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { count: total } = await supabase.from('event_waitlist').select('*', { count: 'exact', head: true });
  const { count: paid } = await supabase.from('event_waitlist').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid');
  const { count: unpaid } = await supabase.from('event_waitlist').select('*', { count: 'exact', head: true }).neq('payment_status', 'paid');

  console.log('');
  console.log('WAITLIST SNAPSHOT - ' + new Date().toLocaleString());
  console.log('----------------------------------------');
  console.log('TOTAL on waitlist : ' + total);
  console.log('PAID              : ' + paid);
  console.log('UNPAID            : ' + unpaid);
  console.log('----------------------------------------');
}
check().catch(e => console.error(e.message));
