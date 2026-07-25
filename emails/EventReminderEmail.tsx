import {
  Button,
  Heading,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface EventReminderEmailProps {
  registrantName: string;
  eventTitle: string;
  eventDate: string;
  eventType: 'online' | 'in_person';
  location?: string | null;
  meetingLink?: string | null;
  email: string;
  isToday?: boolean;
  whatsappLink?: string;
}

export const EventReminderEmail = ({
  registrantName = 'Builder',
  eventTitle = 'AI Builder Meetup',
  eventDate = 'Today',
  eventType = 'online',
  location = '',
  meetingLink = '',
  email = 'builder@example.com',
  isToday = true,
  whatsappLink = 'https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm?s=cl&p=a&ilr=1',
}: EventReminderEmailProps) => {
  const isOnline = eventType === 'online';

  return (
    <EmailLayout previewText={`Reminder: ${eventTitle} is ${isToday ? 'today' : 'tomorrow'}! 🎉`} email={email}>
      <Heading style={heading}>Event {isToday ? 'Today' : 'Tomorrow'}! 🎉</Heading>
      
      <Text style={text}>Hi {registrantName},</Text>
      
      <Text style={text}>
        This is a friendly reminder that <strong>{eventTitle}</strong> is happening {isToday ? 'today' : 'tomorrow'}. We are excited to see you there!
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
            You can join the online session directly using the button below:
          </Text>
          <Button href={meetingLink} style={button}>
            Join Online Meeting
          </Button>
          <Text style={rawLinkText}>
            Or copy this link: <br />
            <a href={meetingLink} style={linkColor}>{meetingLink}</a>
          </Text>
        </Section>
      )}

      {/* WhatsApp Community Button */}
      <Section style={buttonContainer}>
        <Text style={linkNote}>
          Make sure you join our WhatsApp Community for updates and session notifications:
        </Text>
        <Button href={whatsappLink} style={secondaryButton}>
          Join WhatsApp Community
        </Button>
        <Text style={rawLinkText}>
          Or copy this link: <br />
          <a href={whatsappLink} style={linkColor}>{whatsappLink}</a>
        </Text>
      </Section>

      {!isOnline && (
        <Text style={noteText}>
          Please aim to arrive 10-15 minutes early. If you need any assistance, feel free to reply directly to this email.
        </Text>
      )}

      <Text style={text}>
        See you {isToday ? 'today' : 'tomorrow'}!
      </Text>
      
      <Text style={signoff}>
        — The Sena Academy Team
      </Text>
    </EmailLayout>
  );
};

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
  backgroundColor: '#0552FE',
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

const secondaryButton = {
  backgroundColor: '#25D366', // WhatsApp green
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

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
