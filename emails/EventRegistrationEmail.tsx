import {
  Button,
  Heading,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface EventRegistrationEmailProps {
  registrantName: string;
  eventTitle: string;
  eventDate: string;
  eventType: 'online' | 'in_person';
  location?: string | null;
  meetingLink?: string | null;
  email: string;
}

export const EventRegistrationEmail = ({
  registrantName = 'Builder',
  eventTitle = 'AI Builder Meetup',
  eventDate = 'Saturday, July 25, 2026 at 6:00 PM',
  eventType = 'online',
  location = 'Sena Academy Campus, Accra',
  meetingLink = 'https://meet.google.com/abc-defg-hij',
  email = 'builder@example.com',
}: EventRegistrationEmailProps) => {
  const isOnline = eventType === 'online';
  
  // Use NEXT_PUBLIC_SITE_URL or fall back to production domain, ensuring correct URL domain
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://senaacademy.org';

  return (
    <EmailLayout previewText={`Registration Confirmed: ${eventTitle} 🎉`} email={email}>
      <Heading style={heading}>Registration Confirmed! 🎉</Heading>
      
      <Text style={text}>Hi {registrantName},</Text>
      
      <Text style={text}>
        Your registration for <strong>{eventTitle}</strong> has been successfully confirmed. We are excited to have you join us!
      </Text>
      
      <Section style={detailsContainer}>
        <Text style={detailsHeading}>EVENT DETAILS</Text>
        <Text style={detailsText}>
          <strong>What:</strong> {eventTitle}
        </Text>
        <Text style={detailsText}>
          <strong>When:</strong> {eventDate}
        </Text>
        <Text style={detailsText}>
          <strong>Format:</strong> {isOnline ? 'Online Event' : 'In-Person Event'}
        </Text>
        {!isOnline && location && (
          <Text style={detailsText}>
            <strong>Where:</strong> {location}
          </Text>
        )}
      </Section>
      
      {isOnline && meetingLink && (
        <Section style={buttonContainer}>
          <Text style={linkNote}>
            This is an online event. You can join the meeting directly using the button below:
          </Text>
          <Button href={meetingLink} style={button}>
            Join Online Meeting
          </Button>
          <Text style={rawLinkText}>
            Or copy this link into your browser: <br />
            <a href={meetingLink} style={linkColor}>{meetingLink}</a>
          </Text>
        </Section>
      )}

      {!isOnline && (
        <Text style={noteText}>
          Please plan to arrive 10-15 minutes before the start time. If you have any trouble finding the location, reply to this email for assistance.
        </Text>
      )}

      <Section style={communityContainer}>
        <Text style={communityText}>
          Want to connect with other builders? Join our WhatsApp Community to stay updated on future meetups, challenges, and academy events.
        </Text>
        <Button href="https://senaacademy.org/whatsapp" style={secondaryButton}>
          Join WhatsApp Community
        </Button>
      </Section>

      <Text style={text}>
        See you there — let's build something extraordinary.
      </Text>
      
      <Text style={signoff}>
        — The Sena Academy Team
      </Text>
    </EmailLayout>
  );
};

// Styles compatible with major email clients
const heading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#18181B',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const text = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '0 0 16px 0',
};

const detailsContainer = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const detailsHeading = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#64748B',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
};

const detailsText = {
  fontSize: '13px',
  lineHeight: '1.4',
  color: '#334155',
  margin: '0 0 8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const linkNote = {
  fontSize: '13px',
  color: '#475569',
  margin: '0 0 12px 0',
  lineHeight: '1.4',
};

const button = {
  backgroundColor: '#0552FE', // Brand blue
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  lineHeight: '100%',
};

const rawLinkText = {
  fontSize: '11px',
  color: '#64748B',
  marginTop: '12px',
  lineHeight: '1.4',
  wordBreak: 'break-all' as const,
};

const linkColor = {
  color: '#0552FE',
  textDecoration: 'underline',
};

const noteText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#71717A',
  margin: '24px 0',
};

const communityContainer = {
  borderTop: '1px solid #E4E4E7',
  paddingTop: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const communityText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#71717A',
  margin: '0 0 12px 0',
};

const secondaryButton = {
  backgroundColor: '#22C55E', // WhatsApp Green
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  lineHeight: '100%',
};

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
