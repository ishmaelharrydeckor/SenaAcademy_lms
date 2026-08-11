const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const brevoKeyMatch = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/);
const brevoApiKey = brevoKeyMatch ? brevoKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

if (!brevoApiKey) {
  console.error('BREVO_API_KEY not found in .env.local');
  process.exit(1);
}

const recipients = [
  { name: 'Innocentia', email: 'innocentiabediako@gmail.com' },
  { name: 'Herbert', email: 'darkoherbert9@gmail.com' },
  { name: 'Augustine', email: 'opokuaugustine697@gmail.com' },
  { name: 'Dennis', email: 'slimdon2005@gmail.com' },
  { name: 'Michael', email: 'iphhennom@gmail.com' },
  { name: 'Ishmael', email: 'harrydeckor@gmail.com' } // Copy to you
];

const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';

async function sendBrevoEmails() {
  console.log('Sending WhatsApp community link emails via Brevo...\n');

  for (const r of recipients) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #4F46E5; margin: 0 0 8px 0; font-size: 22px;">Sena Academy</h2>
          <p style="color: #6B7280; margin: 0; font-size: 14px;">Free Live Build Session • September 2026</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>${r.name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
          Thank you for joining the official waitlist for our upcoming free live build session! We're excited to have you with us.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
          To make sure you receive the direct Google Meet access link and free starter code templates before we go live, please tap the button below to join our private WhatsApp Community:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${whatsappLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            👉 Join WhatsApp Community
          </a>
        </div>

        <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 24px;">
          Or copy and paste this link into your browser: <br/>
          <a href="${whatsappLink}" style="color: #4F46E5;">${whatsappLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <p style="font-size: 14px; color: #6B7280; margin: 0;">
          Best regards,<br/>
          <strong>Ishmael Harry-Deckor</strong><br/>
          Founder, Sena Academy
        </p>
      </div>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Ishmael from Sena Academy', email: 'no.reply@senaacademy.org' },
          to: [{ email: r.email, name: r.name }],
          subject: `You're on the waitlist! Join our WhatsApp Community 🎉`,
          htmlContent: html,
        }),
      });

      const data = await response.json();
      console.log(`Sent to ${r.name} (${r.email}): Message ID ${data.messageId || JSON.stringify(data)}`);
    } catch (err) {
      console.error(`Failed to send to ${r.email}:`, err.message);
    }
  }
}

sendBrevoEmails();
