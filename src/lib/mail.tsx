import { Resend } from 'resend';
import * as React from 'react';
import { render } from '@react-email/components';
import { AccessCodeEmail } from '../../emails/AccessCodeEmail';
import { PasswordResetEmail } from '../../emails/PasswordResetEmail';
import { FacilitatorOnboardingEmail } from '../../emails/FacilitatorOnboardingEmail';
import { EventRegistrationEmail } from '../../emails/EventRegistrationEmail';
import { EventReminderEmail } from '../../emails/EventReminderEmail';
import { EventWaitlistEmail } from '../../emails/EventWaitlistEmail';

// Initialize Resend SDK lazily to prevent errors at import/build time
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined in environment variables.');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

// Helper to resolve the sender email dynamically at call-time
const getSenderEmail = () => process.env.SENDER_EMAIL || 'Sena Academy <onboarding@resend.dev>';

// Generic helper to send email, dynamically routing to Brevo or Resend
async function sendMail(
  toEmail: string,
  subject: string,
  reactElement: React.ReactElement
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (brevoApiKey) {
    try {
      console.log(`Routing email to Brevo API for recipient: ${toEmail}`);
      const htmlContent = await render(reactElement);
      
      let senderName = 'Sena Academy';
      let senderEmail = 'support@senaacademy.org';
      
      const senderEnv = getSenderEmail();
      const match = senderEnv.match(/^(.*?)\s*<(.*?)>$/);
      if (match && match[2].includes('support@senaacademy.org')) {
        senderName = match[1].trim();
        senderEmail = match[2].trim();
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail }],
          subject: subject,
          htmlContent: htmlContent
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Brevo.');
      }

      console.log('Email sent successfully via Brevo. Message ID:', data.messageId);
      return { success: true, messageId: data.messageId };
    } catch (err: any) {
      console.error('Error sending email via Brevo:', err);
      return { success: false, error: err };
    }
  } else {
    // Fallback to Resend
    try {
      console.log(`Routing email to Resend API for recipient: ${toEmail}`);
      const { data, error } = await getResend().emails.send({
        from: getSenderEmail(),
        to: toEmail,
        subject: subject,
        react: reactElement,
      });

      if (error) {
        console.error('Error sending email via Resend:', error);
        return { success: false, error };
      }

      console.log('Email sent successfully via Resend. Message ID:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (err: any) {
      console.error('Error sending email via Resend:', err);
      return { success: false, error: err };
    }
  }
}

/**
 * Sends the generated Sena Academy access code to a student.
 */
export async function sendAccessCodeEmail(
  toEmail: string,
  studentName: string,
  accessCode: string,
  cohortName: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  return sendMail(
    toEmail,
    'Your Sena Academy Access Code is Here 🎉',
    <AccessCodeEmail
      studentName={studentName}
      cohortName={cohortName}
      accessCode={accessCode}
      email={toEmail}
    />
  );
}

/**
 * Sends a password reset recovery link to a student.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string,
  studentName: string = 'Trainee',
  expiryWindow: string = '24 hours'
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  return sendMail(
    toEmail,
    'Reset Your Sena Academy Password',
    <PasswordResetEmail
      studentName={studentName}
      resetLink={resetLink}
      expiryWindow={expiryWindow}
    />
  );
}

/**
 * Sends a facilitator onboarding account setup invitation.
 */
export async function sendFacilitatorOnboardingEmail(
  toEmail: string,
  name: string,
  setupLink: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  return sendMail(
    toEmail,
    'Sena Academy: Facilitator Account Created',
    <FacilitatorOnboardingEmail
      name={name}
      setupLink={setupLink}
    />
  );
}

/**
 * Sends event registration confirmation to a user.
 */
export async function sendEventRegistrationEmail(
  toEmail: string,
  registrantName: string,
  event: {
    title: string;
    start_time: string;
    end_time: string;
    event_type: 'online' | 'in_person' | string;
    location?: string | null;
    meeting_link?: string | null;
  }
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    console.log(`Sending event registration email via Resend to: ${toEmail}`);
    
    // Format event date
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const optionsDate: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const optionsTime: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    const formattedDate = start.toLocaleDateString('en-US', optionsDate);
    const startTime = start.toLocaleTimeString('en-US', optionsTime);
    const endTime = end.toLocaleTimeString('en-US', optionsTime);
    const eventDate = `${formattedDate} from ${startTime} to ${endTime}`;
    
    // Construct calendar links
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const calLocation = event.event_type === 'online' 
      ? (event.meeting_link || 'Online via Google Meet') 
      : (event.location || 'Sena Academy');
    const calDetails = `Thank you for registering for ${event.title}! Here are your join details.\n\n${
      event.event_type === 'online' ? `Online Meeting Link: ${event.meeting_link}` : `Venue Location: ${event.location}`
    }\n\nWe look forward to having you!`;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatGoogleDate(start)}/${formatGoogleDate(end)}&details=${encodeURIComponent(
      calDetails
    )}&location=${encodeURIComponent(calLocation)}`;

    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
      event.title
    )}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(
      calDetails
    )}&location=${encodeURIComponent(calLocation)}`;

    return sendMail(
      toEmail,
      `Registration Confirmed: ${event.title} 🎉`,
      <EventRegistrationEmail
        registrantName={registrantName}
        eventTitle={event.title}
        eventDate={eventDate}
        eventType={event.event_type as 'online' | 'in_person'}
        location={event.location}
        meetingLink={event.meeting_link}
        email={toEmail}
        googleCalendarUrl={googleCalendarUrl}
        outlookCalendarUrl={outlookCalendarUrl}
      />
    );
  } catch (err: any) {
    console.error('Error sending event registration email:', err);
    return { success: false, error: err };
  }
}

/**
 * Sends event reminder to a registered attendee.
 */
export async function sendEventReminderEmail(
  toEmail: string,
  registrantName: string,
  event: {
    title: string;
    start_time: string;
    end_time: string;
    event_type: 'online' | 'in_person' | string;
    location?: string | null;
    meeting_link?: string | null;
    cover_image_url?: string | null;
  }
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    console.log(`Sending event reminder email via Resend/Brevo to: ${toEmail}`);
    
    // Format event date
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const now = new Date();
    const isToday = start.toDateString() === now.toDateString();

    const optionsDate: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const optionsTime: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    const formattedDate = start.toLocaleDateString('en-US', optionsDate);
    const startTime = start.toLocaleTimeString('en-US', optionsTime);
    const endTime = end.toLocaleTimeString('en-US', optionsTime);
    const eventDate = `${formattedDate} from ${startTime} to ${endTime}`;

    const subject = isToday 
      ? `Reminder: ${event.title} is today! 🎉` 
      : `Reminder: ${event.title} is tomorrow! 🎉`;

    return sendMail(
      toEmail,
      subject,
      <EventReminderEmail
        registrantName={registrantName}
        eventTitle={event.title}
        eventDate={eventDate}
        eventType={event.event_type as 'online' | 'in_person'}
        location={event.location}
        meetingLink={event.meeting_link}
        email={toEmail}
        isToday={isToday}
        coverImageUrl={event.cover_image_url}
      />
    );
  } catch (err: any) {
    console.error('Error sending event reminder email:', err);
    return { success: false, error: err };
  }
}

/**
 * Sends waitlist reminder update to a user.
 */
export async function sendEventWaitlistEmail(
  toEmail: string,
  registrantName: string,
  event: {
    title: string;
    start_time: string;
    end_time: string;
    event_type?: string;
    location?: string | null;
    meeting_link?: string | null;
    cover_image_url?: string | null;
  }
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    console.log(`Sending event waitlist email via Resend/Brevo to: ${toEmail}`);
    
    // Format event date
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const now = new Date();
    const isToday = start.toDateString() === now.toDateString();

    const optionsDate: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const optionsTime: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    
    const formattedDate = start.toLocaleDateString('en-US', optionsDate);
    const startTime = start.toLocaleTimeString('en-US', optionsTime);
    const endTime = end.toLocaleTimeString('en-US', optionsTime);
    const eventDate = `${formattedDate} from ${startTime} to ${endTime}`;

    const subject = `🎉 You're on the list! (Free Live Online Workshop + Free AI Guide)`;

    return sendMail(
      toEmail,
      subject,
      <EventWaitlistEmail
        registrantName={registrantName}
        eventTitle={event.title}
        eventDate="September 2026"
        email={toEmail}
        whatsappLink="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1"
      />
    );
  } catch (err: any) {
    console.error('Error sending event waitlist email:', err);
    return { success: false, error: err };
  }
}
