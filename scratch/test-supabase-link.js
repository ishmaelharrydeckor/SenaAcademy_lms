const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testGenerate() {
  try {
    const email = 'test_diag_user@example.com';
    
    // Ensure test user exists so we can generate a recovery link for them
    console.log('Checking / creating test user...');
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { full_name: 'Test Diagnostic' }
    });
    
    if (userError && userError.message.includes('already exists')) {
      console.log('User already exists, continuing...');
    } else if (userError) {
      throw userError;
    } else {
      console.log('Created test user:', userData.user.id);
    }
    
    console.log('Generating link...');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    });
    
    if (linkErr) throw linkErr;
    console.log('SUCCESS! Generated link:');
    console.log(linkData.properties.action_link);
    
    // Clean up
    console.log('Cleaning up test user...');
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const testUser = listData.users.find(u => u.email === email);
    if (testUser) {
      await supabaseAdmin.auth.admin.deleteUser(testUser.id);
      console.log('Deleted test user.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testGenerate();
