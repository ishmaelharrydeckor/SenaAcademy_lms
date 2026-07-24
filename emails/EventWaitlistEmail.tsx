import {
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
}

export const EventWaitlistEmail = ({
  registrantName = 'Builder',
  eventTitle = 'AI Builder Meetup',
  eventDate = 'Tomorrow',
  email = 'builder@example.com',
}: EventWaitlistEmailProps) => {
  return (
    <EmailLayout previewText={`Waitlist Update: ${eventTitle} tomorrow`} email={email}>
      <Heading style={heading}>Waitlist Update</Heading>
      
      <Text style={text}>Hi {registrantName},</Text>
      
      <Text style={text}>
        We wanted to reach out because you are currently on the waitlist for <strong>{eventTitle}</strong>, which takes place tomorrow.
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
        We are actively monitoring final capacity. If a spot becomes available for you, we will contact you directly with an invitation link so you can join.
      </Text>

      <Text style={text}>
        Thank you for your patience and interest!
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

const signoff = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#18181B',
  margin: '16px 0 0 0',
  fontWeight: '500',
};
