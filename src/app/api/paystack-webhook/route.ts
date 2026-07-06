import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendAccessCodeEmail } from '@/lib/mail';

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

    if (!email || !cohortId) {
      console.error('Webhook payload is missing student email or cohort_id metadata.');
      return NextResponse.json({ error: 'Missing metadata in payload' }, { status: 400 });
    }

    // 3. Prevent duplicate processing
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (existingPayment) {
      console.log(`Payment reference ${reference} has already been processed.`);
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // 4. Log Payment Attempt in Database
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

    // 5. Generate unique access code
    const generatedCode = 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Set expiry date to 30 days from now
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

    // Get Cohort details to include in email
    const { data: cohortData } = await supabaseAdmin
      .from('cohorts')
      .select('name')
      .eq('id', cohortId)
      .single();
    
    const cohortName = cohortData?.name || 'Selected Cohort';

    // 6. Trigger SMTP Email containing the access code
    const emailResult = await sendAccessCodeEmail(email, fullName, generatedCode, cohortName);

    if (emailResult.success) {
      // Mark code generated & sent as complete
      await supabaseAdmin
        .from('payments')
        .update({ access_code_generated: true })
        .eq('paystack_reference', reference);
    } else {
      console.error('Failed to automatically email access code to student.');
    }

    return NextResponse.json({ status: 'success', reference, code: generatedCode });

  } catch (err: any) {
    console.error('Exception in Paystack webhook handler:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
