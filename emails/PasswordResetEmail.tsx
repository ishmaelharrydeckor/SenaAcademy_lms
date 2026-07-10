import {
  Button,
  Heading,
  Text,
  Section,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface PasswordResetEmailProps {
  studentName: string;
  resetLink: string;
  expiryWindow?: string;
}

export const PasswordResetEmail = ({
  studentName = 'Student',
  resetLink = 'https://senaacademy.org/reset-password?token=example',
  expiryWindow = '24 hours',
}: PasswordResetEmailProps) => {
  return (
    <EmailLayout previewText="Reset Your Sena Academy Password">
      <Heading style={heading}>Reset Your Password</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        We received a request to reset your password for your Sena Academy account. Click the button below to choose a new one.
      </Text>
      
      <Section style={buttonContainer}>
        <Button href={resetLink} style={button}>
          Reset My Password
        </Button>
      </Section>
      
      <Text style={noteText}>
        This link will expire in {expiryWindow} for your security. If you didn't request this, you can safely ignore this email — your password won't be changed.
      </Text>
      
      <Text style={fallbackText}>
        Button not working? Copy and paste this link into your browser:{' '}
        <Link href={resetLink} style={link}>
          {resetLink}
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

const noteText = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: '#71717A',
  margin: '0 0 24px 0',
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
