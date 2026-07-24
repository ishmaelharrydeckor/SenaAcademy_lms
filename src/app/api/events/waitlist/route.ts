import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Initialize a server-side Supabase client with the service role key to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { eventId, fullName, email } = await request.json();

    if (!eventId || !fullName || !email) {
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
    const { data: waitlistData, error: waitlistError } = await supabaseAdmin
      .from('event_waitlist')
      .insert({
        event_id: eventId,
        full_name: fullName,
        email: email.toLowerCase().trim()
      })
      .select()
      .single();

    if (waitlistError) {
      console.error('Failed to join waitlist:', waitlistError.message);
      return NextResponse.json({ error: 'Failed to join waitlist. Database error.' }, { status: 500 });
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
