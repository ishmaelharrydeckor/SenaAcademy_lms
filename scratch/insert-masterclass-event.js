const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const eventId = 'fa7a4192-2b62-411a-8c34-b90f1b65c78b';

const masterclassEvent = {
  id: eventId,
  title: 'Free AI & Web App Masterclass',
  slug: 'free-ai-masterclass',
  description: 'Learn how to use AI to build fully functional web applications in under 2 hours. Discover productivity hacks, prompt engineering for code generation, and modern web application workflows. Suitable for absolute beginners.',
  cover_image_url: 'https://i.imgur.com/KNJpRUr.jpeg', // Fallback default banner image
  event_type: 'online',
  location: null,
  meeting_link: null,
  start_time: '2026-08-08T18:00:00+00:00', // Saturday, August 8th at 6:00 PM GMT
  end_time: '2026-08-08T20:00:00+00:00',
  is_paid: false,
  price: null,
  currency: 'GHS',
  capacity: 250,
  status: 'published',
  created_by: 'ae6e2fe3-c674-4a8f-8ae1-030662e9602f' // Default facilitator user
};

async function seed() {
  console.log('Inserting masterclass event into Supabase events table...');
  const { data, error } = await supabase
    .from('events')
    .upsert(masterclassEvent, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('[-] Error seeding event:', error.message);
    process.exit(1);
  }

  console.log('[+] Masterclass event seeded successfully:');
  console.log(data);
}

seed().catch(console.error);
