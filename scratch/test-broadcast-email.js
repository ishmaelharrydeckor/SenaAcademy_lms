const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const brevoKeyMatch = envContent.match(/BREVO_API_KEY\s*=\s*(.*)/);
const brevoApiKey = brevoKeyMatch ? brevoKeyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

const imageUrl = 'https://senaacademy.org/paystack-proof.jpg';
const whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1';

async function sendTestEmail() {
  console.log('Sending lightweight HTML test email to harrydeckor@gmail.com and ishmaelharrydeckor@gmail.com...\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      
      <div style="margin-bottom: 24px;">
        <h2 style="color: #4F46E5; margin: 0 0 4px 0; font-size: 22px; font-weight: 800;">Sena Academy</h2>
        <p style="color: #6B7280; margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Free Live Build Session • September 2026</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hi <strong>Ishmael</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        For most of July, my tech earnings were sitting at completely flat <strong>zero Cedis</strong>.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        Like a lot of people trying to break into tech, I was stuck in tutorial purgatory—spending weeks watching endless YouTube videos, trying to memorize complicated coding syntax, and making zero progress with real clients.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
        Then, I made a critical shift:
      </p>

      <div style="background-color: #F3F4F6; border-left: 4px solid #4F46E5; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1F2937; line-height: 1.5;">
          I stopped trying to write code manually line-by-line, and started using modern AI developer tools to build and ship real software.
        </p>
      </div>

      <h3 style="color: #111827; font-size: 18px; margin: 28px 0 12px 0;">The 48-Hour Breakthrough:</h3>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        When the organizers of the <strong>M.M.M 1.0 Conference at KNUST</strong> needed a fast digital registration system for hundreds of attendees, an agency would have taken 4 weeks.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 20px;">
        Using modern AI development workflows (Cursor, Next.js, and Supabase), <strong>I built and shipped the entire live platform in 48 hours.</strong>
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        On event day, the registration flow was completely seamless. And between July 29th and August 2nd, my Paystack dashboard spiked to <strong>GHS 3,650 in a single week</strong>:
      </p>

      <!-- Hosted Image from senaacademy.org -->
      <div style="text-align: center; margin: 24px 0;">
        <img src="${imageUrl}" alt="Paystack Revenue GHS 3,650" style="max-width: 100%; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" />
        <p style="font-size: 12px; color: #6B7280; margin-top: 8px; font-style: italic;">Paystack Revenue: GHS 3,650 (July 29 - Aug 2 spike)</p>
      </div>

      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />

      <h3 style="color: #111827; font-size: 18px; margin: 0 0 12px 0;">What This Means For You:</h3>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
        You don’t need a 4-year computer science degree, and you don’t need to spend 6 months memorizing syntax to build software that solves real problems in Ghana.
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        In September, I am hosting a <strong>100% free live workshop</strong> on Google Meet where we will open our laptops and build a working, deployed web app together from scratch.
      </p>

      <!-- WhatsApp CTA Button -->
      <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
        <h4 style="color: #166534; margin: 0 0 8px 0; font-size: 17px; font-weight: 700;">👉 Step 1: Join Our Private WhatsApp Community</h4>
        <p style="color: #15803D; font-size: 14px; margin: 0 0 18px 0; line-height: 1.5;">
          Get the exact September workshop date, Google Meet access link, and free starter code templates:
        </p>
        <a href="${whatsappLink}" style="background-color: #25D366; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.2);">
          Join WhatsApp Community
        </a>
      </div>

      <p style="font-size: 14px; color: #6B7280; line-height: 1.5; margin-bottom: 24px;">
        Or copy and paste this link into your browser: <br/>
        <a href="${whatsappLink}" style="color: #4F46E5;">${whatsappLink}</a>
      </p>

      <p style="font-size: 15px; color: #374151; margin: 0;">
        Best regards,<br/>
        <strong>Ishmael Harry-Deckor</strong><br/>
        Founder, Sena Academy<br/>
        <em style="color: #6B7280; font-size: 13px;">“Stop learning to code. Start learning to build.”</em>
      </p>
    </div>
  `;

  const targets = [
    { email: 'harrydeckor@gmail.com', name: 'Ishmael' },
    { email: 'ishmaelharrydeckor@gmail.com', name: 'Ishmael' }
  ];

  for (const t of targets) {
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
          to: [{ email: t.email, name: t.name }],
          subject: `How I made GHS 3,650 in 7 days (without writing code by hand) 📸`,
          htmlContent: html,
        }),
      });

      const data = await response.json();
      console.log(`Sent to ${t.email}! Result:`, data);
    } catch (err) {
      console.error(`Failed to send to ${t.email}:`, err);
    }
  }
}

sendTestEmail();
