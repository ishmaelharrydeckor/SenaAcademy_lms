import {
  Button,
  Heading,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface AccessCodeEmailProps {
  studentName: string;
  cohortName: string;
  accessCode: string;
  email: string;
}

export const AccessCodeEmail = ({
  studentName = 'Student',
  cohortName = 'Web Development Cohort 1',
  accessCode = 'SENA-ABCD-1234',
  email = 'student@example.com',
}: AccessCodeEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://senaacademy.org';

  return (
    <EmailLayout previewText="Your Sena Academy Access Code is Here 🎉" email={email}>
      <Heading style={heading}>Welcome to Sena Academy!</Heading>
      
      <Text style={text}>Hi {studentName},</Text>
      
      <Text style={text}>
        Welcome to Sena Academy! Your payment has been confirmed and your seat in{' '}
        <strong>{cohortName}</strong> is secured.
      </Text>
      
      <Section style={codeContainer}>
        <Text style={codeText}>{accessCode}</Text>
      </Section>
      
      <Text style={text}>
        Head to senaacademy.org, click <strong>Redeem an Access Code</strong>, and enter this code along with your email to set up your password and get started.
      </Text>
      
      <Section style={buttonContainer}>
        <Button href={baseUrl} style={button}>
          Redeem Your Code
        </Button>
      </Section>
      
      <Text style={noteText}>
        This code is single-use and tied to your email address ({email}). Keep it safe.
      </Text>
      
      <Text style={text}>
        See you inside the workspace — let's build something extraordinary.
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

const codeContainer = {
  backgroundColor: '#EFF6FF', // Light blue background tint
  border: '1px dashed #BFDBFE',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const codeText = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '24px',
  fontWeight: '700',
  color: '#0552FE', // Brand blue
  margin: '0',
  letterSpacing: '1.5px',
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

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
