import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, cohortId } = await request.json();

    if (!fullName || !email || !cohortId) {
      return NextResponse.json({ error: 'Missing required registration details' }, { status: 400 });
    }

    // Fetch cohort price from database
    const { data: cohort, error: cohortError } = await supabaseAdmin
      .from('cohorts')
      .select('price')
      .eq('id', cohortId)
      .single();

    if (cohortError) {
      console.error('Error fetching cohort price:', cohortError);
    }

    const price = cohort?.price ? Number(cohort.price) : 100;
    const amountInPesewas = Math.round(price * 100);
    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const appUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://senaacademy.org');

    const paystackKey = process.env.PAYSTACK_SECRET_KEY || '';
    console.log(`[PAYSTACK DEBUG] Key starts with: ${paystackKey.substring(0, 7)}... Length: ${paystackKey.length}`);
    console.log(`Initializing Paystack transaction for: ${email}`);
    
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
        currency: 'GHS',
        callback_url: `${appUrl}/enroll`,
        metadata: {
          full_name: fullName,
          cohort_id: cohortId,
        },
      }),
    });

    if (!paystackRes.ok) {
      const errText = await paystackRes.text();
      console.error('Paystack initialization failed:', errText);
      return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 502 });
    }

    const data = await paystackRes.json();
    if (!data.status || !data.data?.authorization_url) {
      return NextResponse.json({ error: 'Invalid response from Paystack API' }, { status: 500 });
    }

    // Return the authorization url to redirect to checkout
    return NextResponse.json({ authorization_url: data.data.authorization_url });

  } catch (err: any) {
    console.error('Error in init-payment API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
