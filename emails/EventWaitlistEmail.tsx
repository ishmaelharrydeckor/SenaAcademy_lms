import {
  Button,
  Heading,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface EventWaitlistEmailProps {
  registrantName: string;
  eventTitle: string;
  eventDate: string;
  email: string;
  isToday?: boolean;
  whatsappLink?: string;
  meetingLink?: string | null;
}

export const EventWaitlistEmail = ({
  registrantName = 'Builder',
  eventTitle = 'AI Builder Meetup',
  eventDate = 'Today',
  email = 'builder@example.com',
  isToday = true,
  whatsappLink = 'https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm?s=cl&p=a&ilr=1',
  meetingLink = '',
}: EventWaitlistEmailProps) => {
  return (
    <EmailLayout previewText={`Waitlist Update: ${eventTitle} ${isToday ? 'today' : 'tomorrow'}`} email={email}>
      <Heading style={heading}>Waitlist Update</Heading>
      
      <Text style={text}>Hi {registrantName},</Text>
      
      <Text style={text}>
        We wanted to reach out because you are currently on the waitlist for <strong>{eventTitle}</strong>, which takes place {isToday ? 'today' : 'tomorrow'}.
      </Text>
      
      <Section style={detailsContainer}>
        <Text style={detailsHeading}>EVENT DETAILS</Text>
        <Text style={detailsText}>
          <strong>What:</strong> {eventTitle}
        </Text>
        <Text style={detailsText}>
          <strong>When:</strong> {eventDate}
        </Text>
      </Section>
      
      <Text style={text}>
        We are actively monitoring capacity. Since the event is starting soon, we want to make sure you have the links to join the online session directly or keep up to date in our community:
      </Text>

      {meetingLink && (
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
          Join our WhatsApp Community to get real-time updates and notifications:
        </Text>
        <Button href={whatsappLink} style={secondaryButton}>
          Join WhatsApp Community
        </Button>
        <Text style={rawLinkText}>
          Or copy this link: <br />
          <a href={whatsappLink} style={linkColor}>{whatsappLink}</a>
        </Text>
      </Section>
      
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

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
