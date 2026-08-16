import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBroadcastEmail } from '@/lib/mail';
import { sendArkeselSMS } from '@/lib/sms';
import { sendMNotifyRobocall } from '@/lib/robocall';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Gate to Admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse request payload
    const {
      targetGroup, // 'all_students' | 'facilitators' | 'event_registrants' | 'event_waitlist' | 'manual_list'
      channel, // 'email' | 'sms' | 'robocall'
      eventId, // optional, for event waitlist/registrants
      subject, // email only
      message, // email HTML/plain or SMS text
      voiceId, // robocall voice file ID
      campaignName = 'Broadcast', // robocall campaign name
      manualRecipients = [], // string[] for manual input
    } = await request.json();

    if (!targetGroup || !channel) {
      return NextResponse.json({ error: 'Bad Request: Missing targetGroup or channel' }, { status: 400 });
    }

    if (channel === 'email' && !subject) {
      return NextResponse.json({ error: 'Bad Request: Missing subject for email broadcast' }, { status: 400 });
    }

    if (channel !== 'robocall' && !message) {
      return NextResponse.json({ error: 'Bad Request: Missing message body' }, { status: 400 });
    }

    if (channel === 'robocall' && !voiceId) {
      return NextResponse.json({ error: 'Bad Request: Missing voiceId for robocall' }, { status: 400 });
    }

    // 4. Fetch Recipient Data
    let recipients: { email: string; phone: string; name: string }[] = [];

    if (targetGroup === 'all_students') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('role', 'student');
      if (error) throw error;
      recipients = (data || []).map(r => ({ email: r.email, phone: '', name: r.full_name }));
    } 
    
    else if (targetGroup === 'facilitators') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('role', 'facilitator');
      if (error) throw error;
      recipients = (data || []).map(r => ({ email: r.email, phone: '', name: r.full_name }));
    } 
    
    else if (targetGroup === 'event_registrants') {
      if (!eventId) {
        return NextResponse.json({ error: 'Bad Request: Missing eventId' }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin
        .from('event_registrations')
        .select('email, full_name')
        .eq('event_id', eventId)
        .in('payment_status', ['paid', 'not_required']);
      if (error) throw error;
      recipients = (data || []).map(r => ({ email: r.email, phone: '', name: r.full_name }));
    } 
    
    else if (targetGroup === 'event_waitlist') {
      if (!eventId) {
        return NextResponse.json({ error: 'Bad Request: Missing eventId' }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin
        .from('event_waitlist')
        .select('email, full_name, phone')
        .eq('event_id', eventId);
      if (error) throw error;
      recipients = (data || []).map(r => ({ email: r.email, phone: r.phone || '', name: r.full_name }));
    } 
    
    else if (targetGroup === 'manual_list') {
      if (!manualRecipients || manualRecipients.length === 0) {
        return NextResponse.json({ error: 'Bad Request: Missing manualRecipients list' }, { status: 400 });
      }
      recipients = manualRecipients.map((entry: string) => {
        const trimmed = entry.trim();
        const isEmail = trimmed.includes('@');
        return {
          email: isEmail ? trimmed : '',
          phone: !isEmail ? trimmed : '',
          name: isEmail ? trimmed.split('@')[0] : 'Recipient',
        };
      });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: true, message: 'No recipients found for the selected target group.', sentCount: 0 });
    }

    console.log(`[Broadcast API] Dispatching to ${recipients.length} recipients via channel: ${channel}`);

    let sentCount = 0;
    let failedCount = 0;
    const failures: { recipient: string; error: string }[] = [];

    // 5. Execute Dispatch by Channel
    if (channel === 'email') {
      // Loop and send emails
      for (const recipient of recipients) {
        const toEmail = recipient.email;
        if (!toEmail) continue;

        const result = await sendBroadcastEmail(
          toEmail,
          subject,
          subject, // preview text matches subject
          message
        );

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
          failures.push({ recipient: toEmail, error: result.error?.message || 'Unknown error' });
        }
        await delay(150); // Rate-limiting delay (Resend has 10 reqs/sec free tier limit)
      }
    } 
    
    else if (channel === 'sms') {
      // Collect all phone numbers
      const phoneNumbers = recipients
        .map(r => r.phone)
        .filter(p => p && p.trim() !== '');

      if (phoneNumbers.length === 0) {
        return NextResponse.json({ error: 'Bad Request: Selected recipients do not have phone numbers.' }, { status: 400 });
      }

      // Arkesel SMS supports bulk send in a single API call, so we call it directly instead of looping.
      const result = await sendArkeselSMS(phoneNumbers, message);

      if (result.success) {
        sentCount = phoneNumbers.length;
      } else {
        failedCount = phoneNumbers.length;
        failures.push({ recipient: 'Bulk SMS List', error: result.error || 'Failed to dispatch via Arkesel' });
      }
    } 
    
    else if (channel === 'robocall') {
      // Collect phone numbers
      const phoneNumbers = recipients
        .map(r => r.phone)
        .filter(p => p && p.trim() !== '');

      if (phoneNumbers.length === 0) {
        return NextResponse.json({ error: 'Bad Request: Selected recipients do not have phone numbers.' }, { status: 400 });
      }

      // mNotify supports bulk voice call in a single API call
      const result = await sendMNotifyRobocall(phoneNumbers, voiceId, campaignName);

      if (result.success) {
        sentCount = phoneNumbers.length;
      } else {
        failedCount = phoneNumbers.length;
        failures.push({ recipient: 'Bulk Robocall List', error: result.error || 'Failed to dispatch via mNotify' });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      failures,
      message: `Broadcast finished. Dispatched ${sentCount} successfully, ${failedCount} failed.`
    });

  } catch (err: any) {
    console.error('[Broadcast API] Internal error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
