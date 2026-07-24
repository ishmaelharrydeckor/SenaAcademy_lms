import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEventReminderEmail, sendEventWaitlistEmail } from '@/lib/mail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

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

    // 3. Get eventId from request
    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Bad Request: Missing eventId' }, { status: 400 });
    }

    // 4. Fetch Event Details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 5. Fetch confirmed registrants (payment_status is paid or not_required)
    const { data: registrants, error: regError } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .in('payment_status', ['paid', 'not_required']);

    if (regError) {
      console.error('Error fetching event registrants:', regError.message);
      return NextResponse.json({ error: 'Failed to fetch event registrants' }, { status: 500 });
    }

    // 6. Fetch waitlisted users (try event_waitlist, fallback to empty array if table not created yet)
    let waitlist: any[] = [];
    try {
      const { data: waitlistData, error: wlError } = await supabaseAdmin
        .from('event_waitlist')
        .select('*')
        .eq('event_id', eventId);
      
      if (!wlError && waitlistData) {
        waitlist = waitlistData;
      } else if (wlError) {
        console.warn('Could not fetch from event_waitlist (table may not be created yet):', wlError.message);
      }
    } catch (e) {
      console.error('Exception reading event_waitlist:', e);
    }

    console.log(`Admin dispatching reminders for Event "${event.title}". Registrants: ${registrants.length}, Waitlist: ${waitlist.length}`);

    // 7. Dispatch emails in parallel/batches
    let sentRegistrants = 0;
    let failedRegistrants = 0;
    let sentWaitlist = 0;
    let failedWaitlist = 0;

    // Send to registrants
    const registrantPromises = registrants.map(async (reg) => {
      const result = await sendEventReminderEmail(reg.email, reg.full_name, event);
      if (result.success) {
        sentRegistrants++;
      } else {
        failedRegistrants++;
      }
    });

    // Send to waitlist
    const waitlistPromises = waitlist.map(async (wl) => {
      const result = await sendEventWaitlistEmail(wl.email, wl.full_name, event);
      if (result.success) {
        sentWaitlist++;
      } else {
        failedWaitlist++;
      }
    });

    await Promise.all([...registrantPromises, ...waitlistPromises]);

    return NextResponse.json({
      success: true,
      summary: {
        registrants: { total: registrants.length, sent: sentRegistrants, failed: failedRegistrants },
        waitlist: { total: waitlist.length, sent: sentWaitlist, failed: failedWaitlist }
      },
      message: `Dispatched ${sentRegistrants} reminders and ${sentWaitlist} waitlist updates.`
    });

  } catch (err: any) {
    console.error('Error in send-reminders API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
