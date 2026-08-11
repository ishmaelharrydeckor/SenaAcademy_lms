const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const brevoKeyMatch = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/);
const brevoApiKey = brevoKeyMatch ? brevoKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

async function testWelcomeEmail() {
  const targetEmail = 'ishmaelharrydeckor@gmail.com';
  console.log(`Sending live test welcome email to: ${targetEmail}...`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Sena Academy', email: 'support@senaacademy.org' },
      to: [{ email: targetEmail, name: 'Ishmael' }],
      subject: "🎉 You're on the list! (Free Live Online Workshop + Free AI Guide)",
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #4F46E5; margin: 0 0 16px 0;">🎉 You're on the Waitlist!</h2>
          <p style="font-size: 16px; line-height: 1.6;">Hi Ishmael,</p>
          <p style="font-size: 16px; line-height: 1.6;">You have successfully reserved your spot for our upcoming <strong>Free Live Online Build Workshop</strong> in September!</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <h4 style="color: #1E293B; margin: 0 0 8px 0;">🎁 YOUR FREE WELCOME GIFT</h4>
            <p style="font-size: 14px; line-height: 1.5; margin: 0 0 14px 0;">Read & download your copy of <strong>The Non-Coder Guide to AI: How to Prompt Like a Pro</strong>:</p>
            <a href="https://senaacademy.org/guide" style="background-color: #4F46E5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Read Free AI Guide</a>
          </div>
          <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0;">
            <p style="color: #166534; font-weight: 700; margin: 0 0 10px 0;">Step 2: Join Our Private WhatsApp Community</p>
            <a href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1" style="background-color: #25D366; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">Join WhatsApp Community</a>
          </div>
          <p style="font-size: 14px; color: #6B7280; margin-top: 24px;">— Ishmael Harry-Deckor (Founder, Sena Academy)</p>
        </div>
      `
    })
  });

  const data = await response.json();
  console.log('Brevo API Result:', data);
}

testWelcomeEmail();
