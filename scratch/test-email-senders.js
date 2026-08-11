const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const brevoApiKey = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');
const resendApiKey = envContent.match(/RESEND_API_KEY\s*=\s*(.*)/)[1].trim().replace(/^['"]|['"]$/g, '');

async function checkBrevoSenders() {
  console.log('1. Checking verified senders in Brevo API...');
  try {
    const res = await fetch('https://api.brevo.com/v3/senders', {
      headers: { 'api-key': brevoApiKey }
    });
    const data = await res.json();
    console.log('Verified Brevo Senders:', JSON.stringify(data, null, 2));
    
    // Pick the active verified sender
    const verifiedSender = data.senders?.find(s => s.active) || data.senders?.[0];
    if (verifiedSender) {
      console.log(`\n2. Sending test email using verified sender: ${verifiedSender.email} (${verifiedSender.name})...`);
      
      const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: verifiedSender.name, email: verifiedSender.email },
          to: [{ email: 'harrydeckor@gmail.com', name: 'Ishmael' }],
          subject: 'Test from Verified Brevo Sender: GHS 3,650 Proof',
          htmlContent: '<h2>Test Delivery Successful!</h2><p>This is sent from verified sender: ' + verifiedSender.email + '</p>'
        })
      });
      const sendData = await sendRes.json();
      console.log('Send result via Brevo:', sendData);
    }
  } catch (err) {
    console.error('Brevo error:', err);
  }

  // Also test Resend
  if (resendApiKey) {
    console.log('\n3. Testing Resend delivery...');
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sena Academy <onboarding@resend.dev>',
          to: ['harrydeckor@gmail.com'],
          subject: 'Test from Resend: GHS 3,650 Proof',
          html: '<h2>Test Delivery via Resend Successful!</h2><p>If you see this, Resend delivers instantly.</p>'
        })
      });
      const resendData = await resendRes.json();
      console.log('Send result via Resend:', resendData);
    } catch (err) {
      console.error('Resend error:', err);
    }
  }
}

checkBrevoSenders();
