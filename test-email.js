const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Manually parse .env.local file
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

console.log('--- SMTP Diagnostic Tool ---');
console.log('SMTP_USER:', env.SMTP_USER);
console.log('SMTP_HOST:', env.SMTP_HOST || 'smtp.gmail.com');
console.log('SMTP_PORT:', env.SMTP_PORT || '465');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '465', 10),
  secure: env.SMTP_PORT === '465' || !env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
  },
});

async function runDiagnostics() {
  try {
    console.log('\n1. Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');

    console.log('\n2. Attempting to send test email to errandgogh@gmail.com...');
    const info = await transporter.sendMail({
      from: `"Sena Diagnostics" <${env.SMTP_USER}>`,
      to: 'errandgogh@gmail.com',
      subject: 'SMTP Diagnostic Test',
      text: 'If you receive this, your Google SMTP configuration is working perfectly for external recipients.',
      html: '<p>If you receive this, your Google SMTP configuration is working perfectly for external recipients.</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('\n❌ SMTP DIAGNOSTICS FAILED:');
    console.error(error);
  }
}

runDiagnostics();
