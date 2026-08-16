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

async function deepDive() {
  // Get all records with created_at
  const { data, error } = await supabase
    .from('event_waitlist')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.error(error.message); return; }

  console.log('\n========================================');
  console.log('FULL WAITLIST DEEP DIVE');
  console.log('========================================');
  console.log('Total records:', data.length);

  // Show all available columns from first record
  if (data.length > 0) {
    console.log('\nAVAILABLE COLUMNS:', Object.keys(data[0]).join(', '));
  }

  // Group by month
  const byMonth = {};
  data.forEach(r => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });

  console.log('\nSIGNUPS BY MONTH:');
  Object.entries(byMonth).sort().forEach(([month, count]) => {
    console.log(`  ${month}: ${count} signups`);
  });

  // Group by source/utm if column exists
  const firstRecord = data[0];
  const sourceCol = Object.keys(firstRecord).find(k =>
    k.toLowerCase().includes('source') ||
    k.toLowerCase().includes('utm') ||
    k.toLowerCase().includes('ref') ||
    k.toLowerCase() === 'src'
  );

  if (sourceCol) {
    const bySrc = {};
    data.forEach(r => {
      const s = r[sourceCol] || 'unknown';
      bySrc[s] = (bySrc[s] || 0) + 1;
    });
    console.log(`\nBY SOURCE (${sourceCol}):`);
    Object.entries(bySrc).sort((a,b) => b[1]-a[1]).forEach(([src, count]) => {
      console.log(`  ${src}: ${count}`);
    });
  }

  // Show first 10 and last 10
  console.log('\nFIRST 5 SIGNUPS EVER:');
  data.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i+1}. ${r.first_name || r.name || 'N/A'} | ${r.email || 'N/A'} | ${r.created_at}`);
  });

  console.log('\nLATEST 5 SIGNUPS:');
  data.slice(-5).reverse().forEach((r, i) => {
    console.log(`  ${i+1}. ${r.first_name || r.name || 'N/A'} | ${r.email || 'N/A'} | ${r.created_at}`);
  });

  // Check payment status column name
  const payCol = Object.keys(firstRecord).find(k => k.toLowerCase().includes('pay') || k.toLowerCase().includes('paid'));
  if (payCol) {
    const byPay = {};
    data.forEach(r => {
      const p = r[payCol] || 'null';
      byPay[p] = (byPay[p] || 0) + 1;
    });
    console.log(`\nBY PAYMENT (${payCol}):`);
    Object.entries(byPay).sort((a,b) => b[1]-a[1]).forEach(([s, c]) => {
      console.log(`  ${s}: ${c}`);
    });
  }

  console.log('\n========================================');
}

deepDive().catch(e => console.error(e.message));
