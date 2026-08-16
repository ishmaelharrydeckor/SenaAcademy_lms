import { sanitizePhoneNumber } from './sms';

interface MNotifyResponse {
  success: boolean;
  code?: string;
  message?: string;
  summary?: any;
  error?: string;
}

/**
 * Sends a pre-recorded robocall via mNotify Voice Call API.
 */
export async function sendMNotifyRobocall(
  recipients: string[],
  voiceId: string,
  campaignName: string = 'LMS Alert'
): Promise<MNotifyResponse> {
  try {
    const apiKey = process.env.MNOTIFY_API_KEY;

    if (!apiKey) {
      console.warn('MNOTIFY_API_KEY is not defined in environment variables.');
      return { success: false, error: 'mNotify API Key missing.' };
    }

    if (!voiceId) {
      return { success: false, error: 'Voice file ID (voice_id) is required.' };
    }

    if (recipients.length === 0) {
      return { success: false, error: 'No recipients provided.' };
    }

    // Clean numbers. For mNotify, local or international is accepted.
    // Let's sanitize to digits only, removing non-digits.
    const cleanRecipients = recipients
      .map(r => r.replace(/\D/g, ''))
      .filter(r => r.length >= 9);

    if (cleanRecipients.length === 0) {
      return { success: false, error: 'No valid phone numbers parsed.' };
    }

    console.log(`[Robocall] Dispatching mNotify quick call "${campaignName}" (voice: ${voiceId}) to ${cleanRecipients.length} recipients`);

    const response = await fetch(`https://api.mnotify.com/api/voice/quick?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        campaign: campaignName,
        voice_id: voiceId,
        recipients: cleanRecipients,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Robocall] mNotify API error response:', data);
      return {
        success: false,
        error: data.message || `mNotify responded with HTTP status ${response.status}`,
      };
    }

    console.log('[Robocall] mNotify call dispatched successfully:', data);
    return { success: true, code: data.status, summary: data };
  } catch (err: any) {
    console.error('[Robocall] Exception in sendMNotifyRobocall:', err);
    return { success: false, error: err.message || 'Unknown network error.' };
  }
}
