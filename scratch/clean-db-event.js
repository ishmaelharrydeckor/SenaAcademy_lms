const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const url = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const client = createClient(url, key);

async function clean() {
  console.log('Cleaning old event title and flyers from Supabase database...');
  const { data, error } = await client
    .from('events')
    .update({
      title: 'Free Live Build Workshop',
      cover_image_url: null,
      description: 'Join our free upcoming live build-in-public sessions.'
    })
    .eq('id', '91458b94-24c7-43f7-a734-b90f1b65c78a')
    .select();

  if (error) {
    console.error('Error updating event:', error.message);
  } else {
    console.log('✅ Successfully updated database event:', data);
  }
}

clean();
