import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAccessCodeEmail, sendEventRegistrationEmail } from '@/lib/mail';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

// Initialize a server-side Supabase client with the service role key to bypass RLS policies
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Webhook Signature
    const signature = request.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing x-paystack-signature header' }, { status: 401 });
    }

    const rawBody = await request.text();
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.warn('Paystack webhook signature verification failed.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    
    console.log(`Received Paystack Webhook event: ${event}`);

    // We only process charge.success events
    if (event !== 'charge.success') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const data = payload.data;
    const reference = data.reference;
    const amount = data.amount / 100; // convert from pesewas to GHS
    const currency = data.currency;
    const email = data.customer?.email;
    
    // Extract metadata
    const metadata = data.metadata || {};
    const fullName = metadata.full_name || 'Trainee';
    const cohortId = metadata.cohort_id;
    const eventId = metadata.event_id;

    // Check for email first
    if (!email) {
      console.error(`[Paystack Webhook Error] Missing customer email in payload. Reference: ${reference}`);
      return NextResponse.json({ error: 'Missing customer email in payload' }, { status: 400 });
    }

    // Logging fallback if neither cohortId nor eventId is present
    if (!cohortId && !eventId) {
      console.error(
        `[Paystack Webhook Error] Webhook payload missing both cohort_id and event_id metadata.\n` +
        `Reference: ${reference}\n` +
        `Raw Payload Metadata: ${JSON.stringify(metadata)}\n` +
        `Timestamp: ${new Date().toISOString()}`
      );
      return NextResponse.json({ error: 'Missing cohort_id or event_id metadata' }, { status: 400 });
    }

    // Branch 1: Event Registration
    if (eventId) {
      console.log(`Processing event registration payment for event: ${eventId}, email: ${email}`);
      
      // Prevent duplicate processing
      const { data: existingReg } = await supabaseAdmin
        .from('event_registrations')
        .select('id')
        .eq('paystack_reference', reference)
        .maybeSingle();

      if (existingReg) {
        console.log(`Event registration for reference ${reference} has already been processed.`);
        return NextResponse.json({ status: 'already_processed' }, { status: 200 });
      }

      // Call the atomic capacity-safe registration function
      const { data: regResult, error: regError } = await supabaseAdmin.rpc('register_for_event', {
        p_event_id: eventId,
        p_full_name: fullName,
        p_email: email,
        p_payment_status: 'paid',
        p_paystack_reference: reference
      });

      if (regError || !regResult || regResult.length === 0) {
        console.error('Failed to register for event via RPC:', regError?.message || 'Empty response');
        return NextResponse.json({ error: 'Database registration failed' }, { status: 550 });
      }

      const result = regResult[0];
      if (!result.success) {
        console.error('Event registration blocked by capacity check:', result.error_message);
        return NextResponse.json({ error: result.error_message || 'Event registration failed' }, { status: 400 });
      }

      // Fetch event details to send email
      const { data: eventData } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventData) {
        const emailResult = await sendEventRegistrationEmail(email, fullName, eventData);
        if (!emailResult.success) {
          console.error('Failed to send event registration email:', emailResult.error);
        }
      } else {
        console.warn(`Could not find event ${eventId} to send confirmation email.`);
      }

      return NextResponse.json({ status: 'success', reference, registration_id: result.registration_id });
    }

    // Branch 2: Cohort Admissions
    console.log(`Processing cohort admissions payment for cohort: ${cohortId}, email: ${email}`);

    // Prevent duplicate processing
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (existingPayment && existingPayment.access_code_generated) {
      console.log(`Cohort payment reference ${reference} has already been fully processed.`);
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    let generatedCode = '';

    if (!existingPayment) {
      // Log Payment Attempt in Database
      const { error: insertError } = await supabaseAdmin
        .from('payments')
        .insert({
          email,
          full_name: fullName,
          cohort_id: cohortId,
          paystack_reference: reference,
          amount,
          currency,
          status: 'success',
          access_code_generated: false,
        });

      if (insertError) {
        console.error('Failed to log payment transaction:', insertError.message);
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
      }
    }

    // Check if an access code was already generated for this cohort and email in unused status
    const { data: existingCode } = await supabaseAdmin
      .from('access_codes')
      .select('code')
      .eq('assigned_email', email)
      .eq('cohort_id', cohortId)
      .eq('status', 'unused')
      .maybeSingle();

    if (existingCode) {
      generatedCode = existingCode.code;
      console.log(`Retrieved existing unused access code: ${generatedCode}`);
    } else {
      // Generate unique access code
      generatedCode = 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: codeError } = await supabaseAdmin
        .from('access_codes')
        .insert({
          code: generatedCode,
          assigned_email: email,
          cohort_id: cohortId,
          role: 'student',
          status: 'unused',
          expires_at: expiresAt,
        });

      if (codeError) {
        console.error('Failed to insert access code:', codeError.message);
        return NextResponse.json({ error: 'Database access code generation failed' }, { status: 500 });
      }
    }

    // Get Cohort details to include in email
    const { data: cohortData } = await supabaseAdmin
      .from('cohorts')
      .select('name')
      .eq('id', cohortId)
      .single();
    
    const cohortName = cohortData?.name || 'Selected Cohort';

    // Trigger SMTP Email containing the access code
    const emailResult = await sendAccessCodeEmail(email, fullName, generatedCode, cohortName);

    if (emailResult.success) {
      // Mark code generated & sent as complete
      await supabaseAdmin
        .from('payments')
        .update({ access_code_generated: true })
        .eq('paystack_reference', reference);
      
      return NextResponse.json({ status: 'success', reference, code: generatedCode });
    } else {
      console.error('Failed to automatically email access code to student. Propagating error to trigger retry.');
      return NextResponse.json({ error: 'Failed to send confirmation email. Webhook will retry.' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Exception in Paystack webhook handler:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
