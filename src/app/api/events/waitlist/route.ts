import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEventWaitlistEmail } from '@/lib/mail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Initialize a server-side Supabase client with the service role key to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { eventId, fullName, email, phone, source: requestSource } = await request.json();

    if (!eventId || !fullName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required details' }, { status: 400 });
    }

    // 1. Fetch Event Details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error(`Event ${eventId} not found:`, eventError?.message);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event is not open' }, { status: 400 });
    }

    // Check if they are already on the waitlist
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('event_waitlist')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You are already on the waitlist for this event!' }, { status: 400 });
    }

    // 2. Insert into event_waitlist
    const cleanEmail = email.toLowerCase().trim();
    const sourceTag = (requestSource || 'direct').toLowerCase().trim();

    const { data: waitlistData, error: waitlistError } = await supabaseAdmin
      .from('event_waitlist')
      .insert({
        event_id: eventId,
        full_name: fullName,
        email: cleanEmail,
        phone: phone.trim()
      })
      .select()
      .single();

    if (waitlistError) {
      console.error('Failed to join waitlist:', waitlistError.message);
      return NextResponse.json({ error: 'Failed to join waitlist. Database error.' }, { status: 500 });
    }

    // 2b. Track source in Upstash Redis KV if configured
    if (process.env.harry_KV_REST_API_URL && process.env.harry_KV_REST_API_TOKEN) {
      try {
        await fetch(`${process.env.harry_KV_REST_API_URL}/set/lead_source:${cleanEmail}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.harry_KV_REST_API_TOKEN}`,
          },
          body: sourceTag,
        });

        // Increment counter
        await fetch(`${process.env.harry_KV_REST_API_URL}/incr/leads_count:${sourceTag}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.harry_KV_REST_API_TOKEN}`,
          },
        });
      } catch (kvErr) {
        console.warn('Could not record lead source in KV:', kvErr);
      }
    }

    // 3. Send automated waitlist confirmation email
    const emailResult = await sendEventWaitlistEmail(email.toLowerCase().trim(), fullName, event);
    if (!emailResult.success) {
      console.error('Failed to send waitlist confirmation email:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      waitlist_id: waitlistData.id,
      message: 'Successfully joined the waitlist!'
    });

  } catch (err: any) {
    console.error('Error in events waitlist API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
