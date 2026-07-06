import nodemailer from 'nodemailer';

// Initialize the SMTP Transporter
// Relies on SMTP_USER and SMTP_PASS (Gmail App Password) in your .env.local
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Sends the generated Sena Academy access code to a student.
 */
export async function sendAccessCodeEmail(
  toEmail: string,
  studentName: string,
  accessCode: string,
  cohortName: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    const info = await transporter.sendMail({
      from: `"Sena Academy" <${process.env.SMTP_USER || 'noreply.senaacademy@gmail.com'}>`,
      to: toEmail,
      subject: `Sena Academy Enrollment: Your Access Code for ${cohortName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #18181b;">
          <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Welcome to Sena Academy!</h2>
          <p style="font-size: 13px; color: #52525b; line-height: 1.5; margin-bottom: 24px;">
            Hi ${studentName},<br/><br/>
            Thank you for completing your payment. Your enrollment for <strong>${cohortName}</strong> is verified. Below is your unique registration access code:
          </p>
          
          <div style="padding: 16px; border-radius: 8px; background-color: #f4f4f5; text-align: center; margin-bottom: 24px; border: 1px solid #e4e4e7;">
            <code style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 750; letter-spacing: 1.5px; color: #2563eb; user-select: all;">${accessCode}</code>
          </div>

          <p style="font-size: 13px; color: #52525b; line-height: 1.5; margin-bottom: 24px;">
            To activate your student profile, click the button below to register:
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 650; text-decoration: none; color: #ffffff; background-color: #2563eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.1), 0 2px 4px -1px rgba(37,99,235,0.06);">
              Activate Account
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="font-size: 11px; color: #a1a1aa; line-height: 1.4; margin: 0; text-align: center;">
            This access code is tied to your email address: ${toEmail}. Please do not share it. If you have questions, please reach out to our team at Sena Academy.
          </p>
        </div>
      `,
    });

    console.log('Access code email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Error sending access code email via nodemailer:', err);
    return { success: false, error: err };
  }
}
