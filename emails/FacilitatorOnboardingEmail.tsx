import {
  Button,
  Heading,
  Text,
  Section,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface FacilitatorOnboardingEmailProps {
  name: string;
  setupLink: string;
}

export const FacilitatorOnboardingEmail = ({
  name = 'Facilitator',
  setupLink = 'https://senaacademy.org/setup-password?token=example',
}: FacilitatorOnboardingEmailProps) => {
  return (
    <EmailLayout previewText="Welcome to Sena Academy — Facilitator Onboarding">
      <Heading style={heading}>Welcome to Sena Academy, {name}!</Heading>
      
      <Text style={text}>Hi {name},</Text>
      
      <Text style={text}>
        An administrator has created a <strong>Facilitator</strong> account for you on the Sena Academy Learning Portal. 
        Click the button below to set up your password and log in to your dashboard:
      </Text>
      
      <Section style={buttonContainer}>
        <Button href={setupLink} style={button}>
          Activate Account
        </Button>
      </Section>
      
      <Text style={fallbackText}>
        Button not working? Copy and paste this link into your browser:{' '}
        <Link href={setupLink} style={link}>
          {setupLink}
        </Link>
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
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

const fallbackText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#71717A',
  margin: '0 0 16px 0',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#0552FE', // Brand blue
  textDecoration: 'underline',
};

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
