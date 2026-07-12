import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 1. Get client IP
    const ip = getClientIp(request);

    // 2. Parse request body
    const bodyText = await request.text();
    let code = '';
    try {
      const parsed = JSON.parse(bodyText);
      code = parsed.code;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Access code is required.' }, { status: 400 });
    }
    
    // 3. Rate Limit Checks (IP based and Code based)
    const ipCheck = await checkRateLimit(ip, 5, 10 * 60 * 1000);
    if (ipCheck.limited) {
      const waitMinutes = Math.ceil(ipCheck.resetMs / 60000);
      return NextResponse.json(
        { error: `Too many attempts from this IP. Please wait ${waitMinutes} minute(s) before trying again.` },
        { status: 429 }
      );
    }

    const codeCheck = await checkRateLimit(`code:${code}`, 5, 10 * 60 * 1000);
    if (codeCheck.limited) {
      const waitMinutes = Math.ceil(codeCheck.resetMs / 60000);
      return NextResponse.json(
        { error: `Too many attempts for this access code. Please wait ${waitMinutes} minute(s) before trying again.` },
        { status: 429 }
      );
    }

    // 4. Call the security definer RPC function to verify code
    const { data, error } = await supabase.rpc('verify_access_code', {
      input_code: code,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const verification = data as { valid: boolean; reason?: string; email?: string; cohort_id?: string; role?: string };
    if (!verification.valid) {
      return NextResponse.json({ error: verification.reason || 'Invalid access code.' }, { status: 400 });
    }

    return NextResponse.json(verification);

  } catch (err: any) {
    console.error('Error verifying access code:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
