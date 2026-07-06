import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAccessCodeEmail } from '@/lib/mail';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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

    // 2. Gate to Admin role only
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse reference
    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json({ error: 'Bad Request: Missing reference' }, { status: 400 });
    }

    // 4. Call Paystack API directly to verify
    console.log(`Manually verifying Paystack reference: ${reference}`);
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!paystackRes.ok) {
      const errText = await paystackRes.text();
      console.error('Paystack API call failed:', errText);
      return NextResponse.json({ error: 'Failed to communicate with Paystack API' }, { status: 502 });
    }

    const result = await paystackRes.json();
    if (!result.status || result.data?.status !== 'success') {
      return NextResponse.json({ error: `Transaction verification failed: ${result.data?.gateway_response || 'Unsuccessful payment'}` }, { status: 400 });
    }

    const data = result.data;
    const amount = data.amount / 100;
    const currency = data.currency;
    const email = data.customer?.email;
    const metadata = data.metadata || {};
    const fullName = metadata.full_name || 'Trainee';
    const cohortId = metadata.cohort_id;

    if (!email || !cohortId) {
      return NextResponse.json({ error: 'Paystack transaction metadata is missing student details or cohort' }, { status: 400 });
    }

    // 5. Check if reference already exists in database
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (existingPayment && existingPayment.access_code_generated) {
      return NextResponse.json({ message: 'Payment verified and access code already exists.', code_generated: false });
    }

    // 6. Log/Update payments table
    if (!existingPayment) {
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
        throw new Error('Failed to insert record: ' + insertError.message);
      }
    }

    // 7. Generate Code
    const generatedCode = 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
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
      throw new Error('Failed to create code: ' + codeError.message);
    }

    // Get Cohort name
    const { data: cohortData } = await supabaseAdmin
      .from('cohorts')
      .select('name')
      .eq('id', cohortId)
      .single();
    
    const cohortName = cohortData?.name || 'Selected Cohort';

    // 8. Send Email
    const emailResult = await sendAccessCodeEmail(email, fullName, generatedCode, cohortName);
    
    if (emailResult.success) {
      await supabaseAdmin
        .from('payments')
        .update({ access_code_generated: true })
        .eq('paystack_reference', reference);
    }

    return NextResponse.json({
      message: 'Payment verified successfully and access code generated.',
      code_generated: true,
      code: generatedCode,
    });

  } catch (err: any) {
    console.error('Error in manual verify payment:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
