import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, cohortId } = await request.json();

    if (!fullName || !email || !cohortId) {
      return NextResponse.json({ error: 'Missing required registration details' }, { status: 400 });
    }

    // Cohort fee is GHS 1,500 (passed in subunits: 150000 pesewas)
    const amountInPesewas = 1500 * 100;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
