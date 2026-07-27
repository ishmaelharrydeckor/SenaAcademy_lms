import {
  Button,
  Heading,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface FoundingBuilderOfferEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  whatsappLink?: string;
}

export const FoundingBuilderOfferEmail = ({
  firstName = 'Builder',
  lastName = '',
  email = 'builder@example.com',
  whatsappLink = 'https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e',
}: FoundingBuilderOfferEmailProps) => {
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <EmailLayout previewText="Your Founding Builder Offer is Here! 🚀" email={email}>
      <Heading style={heading}>Your Founding Builder Offer 🚀</Heading>
      
      <Text style={text}>Hi {fullName},</Text>
      
      <Text style={text}>
        Thank you for joining the Builder Session!
      </Text>
      
      <Text style={text}>
        As promised, you can still join the <strong>Founding Builders Cohort</strong> at the special price of <strong>GHS 100</strong> (regularly GHS 200) for a limited time.
      </Text>
      
      <Text style={text}>
        If you're ready to build with AI, secure your spot by clicking the button below to join the community:
      </Text>
      
      <Section style={buttonContainer}>
        <Button href={whatsappLink} style={button}>
          Secure Your Spot Now
        </Button>
        <Text style={rawLinkText}>
          Or copy and paste this link: <br />
          <a href={whatsappLink} style={linkColor}>{whatsappLink}</a>
        </Text>
      </Section>
      
      <Text style={text}>
        Looking forward to welcoming you.
      </Text>
      
      <Text style={signoff}>
        — Ishmael, Sena Academy
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
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
