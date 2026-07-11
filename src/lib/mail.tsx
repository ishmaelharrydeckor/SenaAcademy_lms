import { Resend } from 'resend';
import * as React from 'react';
import { AccessCodeEmail } from '../../emails/AccessCodeEmail';
import { PasswordResetEmail } from '../../emails/PasswordResetEmail';
import { FacilitatorOnboardingEmail } from '../../emails/FacilitatorOnboardingEmail';
import { EventRegistrationEmail } from '../../emails/EventRegistrationEmail';

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
    console.log(`Sending access code email via Resend to: ${toEmail}`);
    const { data, error } = await getResend().emails.send({
      from: getSenderEmail(),
      to: toEmail,
      subject: 'Your Sena Academy Access Code is Here 🎉',
      react: (
        <AccessCodeEmail
          studentName={studentName}
          cohortName={cohortName}
          accessCode={accessCode}
          email={toEmail}
        />
      ),
    });

    if (error) {
      console.error('Error sending access code email via Resend:', error);
      return { success: false, error };
    }

    console.log('Access code email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Error sending access code email via Resend:', err);
    return { success: false, error: err };
  }
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
  try {
    console.log(`Sending password reset email via Resend to: ${toEmail}`);
    const { data, error } = await getResend().emails.send({
      from: getSenderEmail(),
      to: toEmail,
      subject: 'Reset Your Sena Academy Password',
      react: (
        <PasswordResetEmail
          studentName={studentName}
          resetLink={resetLink}
          expiryWindow={expiryWindow}
        />
      ),
    });

    if (error) {
      console.error('Error sending password reset email via Resend:', error);
      return { success: false, error };
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Error sending password reset email via Resend:', err);
    return { success: false, error: err };
  }
}

/**
 * Sends a facilitator onboarding account setup invitation.
 */
export async function sendFacilitatorOnboardingEmail(
  toEmail: string,
  name: string,
  setupLink: string
): Promise<{ success: boolean; messageId?: string; error?: any }> {
  try {
    console.log(`Sending facilitator onboarding email via Resend to: ${toEmail}`);
    const { data, error } = await getResend().emails.send({
      from: getSenderEmail(),
      to: toEmail,
      subject: 'Sena Academy: Facilitator Account Created',
      react: (
        <FacilitatorOnboardingEmail
          name={name}
          setupLink={setupLink}
        />
      ),
    });

    if (error) {
      console.error('Error sending facilitator onboarding email via Resend:', error);
      return { success: false, error };
    }

    console.log('Facilitator onboarding email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Error sending facilitator onboarding email via Resend:', err);
    return { success: false, error: err };
  }
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

    const { data, error } = await getResend().emails.send({
      from: getSenderEmail(),
      to: toEmail,
      subject: `Registration Confirmed: ${event.title} 🎉`,
      react: (
        <EventRegistrationEmail
          registrantName={registrantName}
          eventTitle={event.title}
          eventDate={eventDate}
          eventType={event.event_type as 'online' | 'in_person'}
          location={event.location}
          meetingLink={event.meeting_link}
          email={toEmail}
        />
      ),
    });

    if (error) {
      console.error('Error sending event registration email via Resend:', error);
      return { success: false, error };
    }

    console.log('Event registration email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('Error sending event registration email via Resend:', err);
    return { success: false, error: err };
  }
}
