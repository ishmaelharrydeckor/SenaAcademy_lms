const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

const kvUrl = envContent.match(/harry_KV_REST_API_URL\s*=\s*(.*)/)?.[1].trim().replace(/^['"]|['"]$/g, '');
const kvToken = envContent.match(/harry_KV_REST_API_TOKEN\s*=\s*(.*)/)?.[1].trim().replace(/^['"]|['"]$/g, '');

const client = createClient(url, key);

async function inspectSources() {
  console.log('\n========================================');
  console.log('📊 REAL-TIME LEAD SOURCE ATTRIBUTION');
  console.log('========================================\n');

  // 1. Total in Supabase
  const { data: waitlist, error } = await client
    .from('event_waitlist')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false });

  console.log(`Total Database Waitlist Signups: ${waitlist?.length || 0}`);

  // 2. Fetch Redis Counters if available
  if (kvUrl && kvToken) {
    try {
      const tiktokRes = await fetch(`${kvUrl}/get/leads_count:tiktok`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const tiktokCount = (await tiktokRes.json())?.result || 0;

      const smsRes = await fetch(`${kvUrl}/get/leads_count:sms`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const smsCount = (await smsRes.json())?.result || 0;

      const directRes = await fetch(`${kvUrl}/get/leads_count:direct`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      const directCount = (await directRes.json())?.result || 0;

      console.log('\n📈 Attribution Breakdown:');
      console.log(`📱 TikTok Signups (src=tiktok): ${tiktokCount}`);
      console.log(`💬 SMS Broadcast Signups (src=sms): ${smsCount}`);
      console.log(`🌐 Direct / Organic Signups: ${directCount}`);
    } catch (e) {
      console.log('KV check:', e.message);
    }
  }

  console.log('\n🕒 Most Recent 5 Signups:');
  (waitlist || []).slice(0, 5).forEach((w, i) => {
    console.log(`${i + 1}. ${w.full_name} (${w.email}) - ${w.created_at}`);
  });
  console.log('\n========================================\n');
}

inspectSources();
