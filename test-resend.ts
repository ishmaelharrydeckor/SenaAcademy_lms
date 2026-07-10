import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

import {
  sendAccessCodeEmail,
  sendPasswordResetEmail,
  sendFacilitatorOnboardingEmail,
} from './src/lib/mail.tsx';

console.log('--- Resend Email Diagnostic Tool ---');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL || 'onboarding@resend.dev');

// Run diagnostics
async function runDiagnostics() {
  // Free tier Resend accounts can only send to the account owner.
  // We'll default to the SMTP_USER or a custom recipient if set, or onboarding email.
  const testRecipient = process.env.TEST_RECIPIENT || 'errandgogh@gmail.com'; 
  
  console.log(`\nTest recipient configured: ${testRecipient}`);

  console.log('\n--- 1. Sending Access Code Email ---');
  const result1 = await sendAccessCodeEmail(
    testRecipient,
    'John Doe',
    'SENA-TEST-9988-7766',
    'Full Stack Web Development (Cohort 1)'
  );
  console.log('Result:', result1);

  console.log('\n--- 2. Sending Password Reset Email ---');
  const result2 = await sendPasswordResetEmail(
    testRecipient,
    'https://senaacademy.org/reset-password?token=example_reset_token',
    'John Doe',
    '1 hour'
  );
  console.log('Result:', result2);

  console.log('\n--- 3. Sending Facilitator Onboarding Email ---');
  const result3 = await sendFacilitatorOnboardingEmail(
    testRecipient,
    'Jane Smith',
    'https://senaacademy.org/reset-password?token=example_setup_token'
  );
  console.log('Result:', result3);
}

runDiagnostics().catch(console.error);
