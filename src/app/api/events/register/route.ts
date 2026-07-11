import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEventRegistrationEmail } from '@/lib/mail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Initialize a server-side Supabase client with the service role key to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    const { eventId, fullName, email } = await request.json();

    if (!eventId || !fullName || !email) {
      return NextResponse.json({ error: 'Missing required registration details' }, { status: 400 });
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
      return NextResponse.json({ error: 'Event is not open for registration' }, { status: 400 });
    }

    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const appUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://senaacademy.org');

    // 2. Handle Paid Event Registration Flow
    if (event.is_paid) {
      const price = Number(event.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ error: 'Invalid event pricing details' }, { status: 500 });
      }

      // Paystack amount must be in subunits (pesewas)
      const amountInPesewas = Math.round(price * 100);

      console.log(`Initializing Paystack transaction for event RSVP: ${email}`);

      // Call Paystack Transaction Initialize API
      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInPesewas,
          currency: event.currency || 'GHS',
          callback_url: `${appUrl}/events/${event.slug}`,
          metadata: {
            full_name: fullName,
            event_id: eventId,
          },
        }),
      });

      if (!paystackRes.ok) {
        const errText = await paystackRes.text();
        console.error('Paystack initialization for event failed:', errText);
        return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 502 });
      }

      const data = await paystackRes.json();
      if (!data.status || !data.data?.authorization_url) {
        return NextResponse.json({ error: 'Invalid response from Paystack API' }, { status: 500 });
      }

      return NextResponse.json({ authorization_url: data.data.authorization_url });
    }

    // 3. Handle Free Event Registration Flow (Capacity safe)
    console.log(`Processing free event registration for event: ${eventId}, email: ${email}`);

    // Call database function atomically
    const { data: regResult, error: regError } = await supabaseAdmin.rpc('register_for_event', {
      p_event_id: eventId,
      p_full_name: fullName,
      p_email: email,
      p_payment_status: 'not_required'
    });

    if (regError || !regResult || regResult.length === 0) {
      console.error('Failed to register for free event via RPC:', regError?.message || 'Empty response');
      return NextResponse.json({ error: 'Database registration failed' }, { status: 500 });
    }

    const result = regResult[0];
    if (!result.success) {
      console.error('Free event registration blocked:', result.error_message);
      return NextResponse.json({ error: result.error_message || 'Registration failed' }, { status: 400 });
    }

    // Send email confirmation
    const emailResult = await sendEventRegistrationEmail(email, fullName, event);
    if (!emailResult.success) {
      console.error('Failed to send free registration confirmation email:', emailResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      registration_id: result.registration_id, 
      message: 'Registration confirmed successfully' 
    });

  } catch (err: any) {
    console.error('Error in events register API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
