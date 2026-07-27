const fs = require('fs');
const path = require('path');

// Excluded emails of students who have already paid
const EXCLUDED_EMAILS = [
  'ababioishmaelkwaku@gmail.com',
  'kntcalystagoe@st.knust.edu.gh',
  'elizabethasanteampomahowusu@gmail.com',
  'julius.amlor@stu.ucc.edu.gh',
  'ernestxorse3@gmail.com',
  'maequaye18@gmail.com',
  'aggreybeatrice73@gmail.com'
].map(email => email.toLowerCase().trim());

// Load env variables
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

const primaryKey = env.BREVO_API_KEY;
const secondaryKey = env.BREVO_API_KEY_SECONDARY; // Optional fallback key
const senderEnv = env.SENDER_EMAIL || 'Sena Academy <support@senaacademy.org>';

let senderName = 'Sena Academy';
let senderEmail = 'support@senaacademy.org';
const match = senderEnv.match(/^(.*?)\s*<(.*?)>$/);
if (match) {
  senderName = match[1].trim();
  senderEmail = match[2].trim();
}

if (!primaryKey) {
  console.error('[Error] BREVO_API_KEY is missing in your .env.local file.');
  process.exit(1);
}

// Contacts and Progress files
const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
const progressFile = path.join(__dirname, 'social_proof_progress.json');

if (!fs.existsSync(contactsFile)) {
  console.error(`[Error] Contacts file not found at: ${contactsFile}`);
  process.exit(1);
}

const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));

// Initialize progress
let progress = { sent: [], failed: [] };
if (fs.existsSync(progressFile)) {
  progress = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

// Filter out already sent and excluded contacts
const pendingContacts = contacts.filter(c => {
  const emailLower = c.email.toLowerCase().trim();
  return !EXCLUDED_EMAILS.includes(emailLower) && 
         !progress.sent.includes(c.email) && 
         !progress.failed.includes(c.email);
});

console.log('=============================================================');
      console.log('       SENA ACADEMY OUTREACH: SOCIAL PROOF EMAIL CAMPAIGN');
console.log('=============================================================');
console.log(`Total Waitlist Contacts: ${contacts.length}`);
console.log(`Excluded (Already Paid): ${EXCLUDED_EMAILS.length}`);
console.log(`Already Sent in campaign: ${progress.sent.length}`);
console.log(`Pending for this run: ${pendingContacts.length}`);

if (pendingContacts.length === 0) {
  console.log('\nAll pending emails have been successfully sent! Nothing to do.');
  process.exit(0);
}

// Helper to send email via Brevo SMTP API
async function sendBrevoEmail(apiKey, toEmail, recipientName, subject, htmlContent) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: recipientName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || 'SMTP request failed' };
    }
    return { success: true, messageId: data.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  let currentKey = primaryKey;
  let keyType = 'Primary';
  let dailySendCount = progress.sent.length; // Tracks total sends for limit calculations

  for (let i = 0; i < pendingContacts.length; i++) {
    const contact = pendingContacts[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const emailLower = contact.email.toLowerCase().trim();

    // Check Brevo free tier limit (300 per key)
    if (keyType === 'Primary' && dailySendCount >= 295) {
      if (secondaryKey) {
        console.log('\n[Daily limit of 300 reached on Primary Brevo account. Switching to Secondary key...]');
        currentKey = secondaryKey;
        keyType = 'Secondary';
        dailySendCount = 0; // Reset counter for secondary key
      } else {
        console.log('\n================================──────────────────────────────');
        console.log('[Stop Warning] Reached 295 sends on your primary Brevo account.');
        console.log('Stopping now to prevent going over Brevo\'s free daily 300 limit.');
        console.log('You can run this script again tomorrow to send the remaining contacts!');
        console.log('================================──────────────────────────────');
        break;
      }
    }

    const subject = 'Founding Builders: Admissions logs update';
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">Founding Builders: Admissions logs update</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Hi ${firstName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Admissions for the Founding Builders Cohort starting this Saturday, August 1st, are filling up.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Our admin registry shows that waitlist members are actively completing their enrollments. We just generated and sent the access codes to the latest batch of builders who secured their slots at the GHS 100 special price (regularly GHS 200).</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">Once these discounted slots are filled, admissions will return to the standard price.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://senaacademy.org/enroll" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; border: 1px solid #000000;">Complete Your Enrollment Here</a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 20px 0;">If you have questions or want to coordinate group access, you can join the pre-cohort WhatsApp group here:<br>
        <a href="https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e" style="color: #0f172a; text-decoration: underline; font-weight: 500;">https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e</a></p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 20px 0;">See you in the first session this Saturday.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 12px; color: #64748b; margin: 0;">— The Sena Academy Team</p>
      </div>
    `;

    console.log(`[${i + 1}/${pendingContacts.length}] Sending to ${contact.name} (${contact.email})...`);

    const result = await sendBrevoEmail(currentKey, contact.email, contact.name, subject, htmlContent);

    if (result.success) {
      console.log(`[+] Sent successfully via ${keyType} Brevo account!`);
      progress.sent.push(contact.email);
      dailySendCount++;
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    } else {
      console.error(`[-] Failed for ${contact.email}:`, result.error);
      progress.failed.push(contact.email);
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    }

    // Wait 1.2 seconds between emails to respect server limits
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log('\nCampaign dispatch finished.');
}

main().catch(console.error);
