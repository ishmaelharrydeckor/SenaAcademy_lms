const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
}

const resendApiKey = env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('[Error] Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const resend = new Resend(resendApiKey);

// Sender details
const senderEnv = env.SENDER_EMAIL || 'Sena Academy <support@senaacademy.org>';
let senderName = 'Sena Academy';
let senderEmail = 'support@senaacademy.org';
const match = senderEnv.match(/^(.*?)\s*<(.*?)>$/);
if (match) {
  senderName = match[1].trim();
  senderEmail = match[2].trim();
}

async function main() {
  const userEmails = [
    { email: 'ishmaelharrydeckor@gmail.com', name: 'Ishmael' },
    { email: 'tonydeckor2019@gmail.com', name: 'Tony' }
  ];

  const teamsLink = 'https://teams.live.com/meet/9380470344303?p=uBwrHXGFSS2GTGEgO7';

  for (const user of userEmails) {
    const emailSubject = '🔴 Direct Link: Module 2 Session (7:00 PM GMT)';
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #ef4444; padding-bottom: 15px;">🔴 Direct Link: Module 2 Session</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${user.name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Here is your direct access invitation link for Module 2:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${teamsLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Join Module 2 Live Session</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`Sending Resend email to ${user.name} (${user.email})...`);
    
    try {
      const data = await resend.emails.send({
        from: `${senderName} <${senderEmail}>`,
        to: [user.email],
        subject: emailSubject,
        html: emailHtml
      });
      console.log(`[+] Resend Success for ${user.email}:`, data);
    } catch (err) {
      console.error(`[-] Resend Failed for ${user.email}:`, err.message);
    }
  }
}

main().catch(console.error);
