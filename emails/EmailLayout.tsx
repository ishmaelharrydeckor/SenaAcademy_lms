import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewText: string;
  email?: string;
  children: React.ReactNode;
}

export const EmailLayout = ({
  previewText,
  email,
  children,
}: EmailLayoutProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://senaacademy.org';
  // Email clients cannot load images from localhost. Fall back to the public production domain during local development.
  const logoUrl = baseUrl.includes('localhost')
    ? 'https://senaacademy.org/logo_full.png'
    : `${baseUrl}/logo_full.png`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Row */}
          <Section style={logoSection}>
            <Img
              src={logoUrl}
              width="180"
              height="40"
              alt="Sena Academy Logo"
              style={logo}
            />
          </Section>
          
          {/* White Card Container */}
          <Section style={card}>
            {children}
          </Section>

          {/* Footer Section */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Sena Academy · <a href="https://senaacademy.org" style={footerLink}>senaacademy.org</a>
            </Text>
            {email && (
              <Text style={footerSubtext}>
                This email was sent to {email}. If you didn't request this, you can safely ignore it.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// CSS-in-JS style objects compatible with all email clients
const main = {
  backgroundColor: '#F4F4F5',
  fontFamily: 'Arial, Helvetica, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '480px',
  padding: '0 16px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const card = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #E4E4E7',
  padding: '32px',
};

const footerSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#71717A',
  margin: '0 0 4px 0',
};

const footerSubtext = {
  fontSize: '11px',
  color: '#A1A1AA',
  margin: '0',
  lineHeight: '1.4',
};

const footerLink = {
  color: '#71717A',
  textDecoration: 'underline',
};
