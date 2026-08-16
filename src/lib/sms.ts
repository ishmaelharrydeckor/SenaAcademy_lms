/**
 * Sanitizes phone numbers for Arkesel (removes non-digits, formats local 0-prefix to 233).
 */
export function sanitizePhoneNumber(phone: string): string {
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If it starts with a local '0', replace with country code '233'
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '233' + digits.substring(1);
  }
  
  return digits;
}

interface ArkeselSMSResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Sends an SMS message to a list of recipients via Arkesel v2 API.
 */
export async function sendArkeselSMS(
  recipients: string[],
  message: string
): Promise<ArkeselSMSResponse> {
  try {
    const apiKey = process.env.ARKESEL_API_KEY;
    const senderId = process.env.ARKESEL_SENDER_ID || 'SenaAcademy';

    if (!apiKey) {
      console.warn('ARKESEL_API_KEY is not defined in environment variables.');
      return { success: false, error: 'Arkesel API Key missing.' };
    }

    if (recipients.length === 0) {
      return { success: false, error: 'No recipients provided.' };
    }

    // Clean all numbers
    const cleanRecipients = recipients
      .map(r => sanitizePhoneNumber(r))
      .filter(r => r.length >= 9); // valid lengths

    if (cleanRecipients.length === 0) {
      return { success: false, error: 'No valid phone numbers parsed.' };
    }

    console.log(`[SMS] Sending Arkesel SMS to ${cleanRecipients.length} recipients via SenderID: ${senderId}`);

    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        message: message,
        recipients: cleanRecipients,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[SMS] Arkesel API error response:', data);
      return {
        success: false,
        error: data.message || `Arkesel responded with HTTP status ${response.status}`,
      };
    }

    console.log('[SMS] Arkesel SMS sent successfully:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('[SMS] Exception in sendArkeselSMS:', err);
    return { success: false, error: err.message || 'Unknown network error.' };
  }
}
