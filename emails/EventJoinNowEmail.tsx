import {
  Button,
  Heading,
  Text,
  Section,
  Img,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface EventJoinNowEmailProps {
  registrantName: string;
  eventTitle: string;
  meetingLink: string;
  email: string;
  coverImageUrl?: string | null;
  whatsappLink?: string;
}

export const EventJoinNowEmail = ({
  registrantName = 'Builder',
  eventTitle = 'THE BUILDER SESSION \'26',
  meetingLink = 'https://meet.google.com/bxd-fpze-rfz',
  email = 'builder@example.com',
  coverImageUrl = 'https://i.imgur.com/KNJpRUr.jpeg',
  whatsappLink = 'https://chat.whatsapp.com/JsXT6Od90Ms77sqiCy5oHm?s=cl&p=a&ilr=1',
}: EventJoinNowEmailProps) => {
  return (
    <EmailLayout previewText={`We are live! Join ${eventTitle} now 🚀`} email={email}>
      <Heading style={heading}>We are live! 🚀</Heading>
      
      {coverImageUrl && (
        <Section style={imageContainer}>
          <Img
            src={coverImageUrl}
            alt={eventTitle}
            width="100%"
            style={coverImage}
          />
        </Section>
      )}
      
      <Text style={text}>Hi {registrantName},</Text>
      
      <Text style={text}>
        The wait is over! <strong>{eventTitle}</strong> is starting right now. The virtual doors are open and the session is underway.
      </Text>
      
      <Text style={text}>
        Click the button below to join the online session directly on Google Meet:
      </Text>
      
      <Section style={buttonContainer}>
        <Button href={meetingLink} style={button}>
          Join Online Meeting Now
        </Button>
        <Text style={rawLinkText}>
          Or copy and paste this link in your browser: <br />
          <a href={meetingLink} style={linkColor}>{meetingLink}</a>
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Text style={linkNote}>
          Make sure you are also in our WhatsApp Community for real-time announcements during the session:
        </Text>
        <Button href={whatsappLink} style={secondaryButton}>
          Join WhatsApp Community
        </Button>
      </Section>
      
      <Text style={text}>
        See you inside!
      </Text>
      
      <Text style={signoff}>
        — The Sena Academy Team
      </Text>
    </EmailLayout>
  );
};

const heading = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#18181B',
  margin: '0 0 20px 0',
  lineHeight: '1.3',
};

const text = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '0 0 16px 0',
};

const imageContainer = {
  margin: '0 0 24px 0',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #E2E8F0',
};

const coverImage = {
  display: 'block',
  width: '100%',
  height: 'auto',
  maxWidth: '600px',
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
