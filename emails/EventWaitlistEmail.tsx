import {
  Button,
  Heading,
  Text,
  Section,
  Img,
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
  coverImageUrl?: string | null;
}

export const EventWaitlistEmail = ({
  registrantName = 'Builder',
  eventTitle = 'Free Live Online Build Workshop',
  email = 'builder@example.com',
  whatsappLink = 'https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1',
}: EventWaitlistEmailProps) => {
  const firstName = registrantName ? registrantName.split(' ')[0] : 'there';
  const guideLink = 'https://senaacademy.org/guide';

  return (
    <EmailLayout previewText="🎉 You're on the list! Here is your Free AI Guide + WhatsApp Access" email={email}>
      <Heading style={heading}>🎉 You're on the Waitlist!</Heading>
      
      <Text style={text}>Hi {firstName},</Text>
      
      <Text style={text}>
        You have successfully reserved your spot for our upcoming <strong>Free Live Online Build Workshop</strong> in September!
      </Text>
      
      <Text style={text}>
        In this live session, we are going to open our laptops together and build a complete, functional web app live on screen in plain English.
      </Text>

      {/* Free Gift Card */}
      <Section style={detailsContainer}>
        <Text style={detailsHeading}>🎁 YOUR FREE WELCOME GIFT</Text>
        <Text style={detailsText}>
          While you wait for our live workshop, I want to give you immediate access to <strong>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</strong>.
        </Text>
        <Text style={detailsText}>
          Inside, you'll discover the 3-part prompt formula to generate web app prototypes in Google AI Studio in 60 seconds.
        </Text>
        <Section style={{ textAlign: 'center', marginTop: '12px' }}>
          <Button href={guideLink} style={button}>
            👉 Read & Download Free AI Guide
          </Button>
        </Section>
      </Section>
      
      {/* WhatsApp Community Button */}
      <Section style={buttonContainer}>
        <Text style={linkNote}>
          <strong>Step 2: Join Our Private WhatsApp Community</strong><br />
          We will be dropping the direct online meeting room link and starter code templates inside our private WhatsApp group:
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
        Best regards,<br />
        <strong>Ishmael Harry-Deckor</strong><br />
        Founder, Sena Academy<br />
        <em>“Stop learning to code. Start learning to build.”</em>
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
