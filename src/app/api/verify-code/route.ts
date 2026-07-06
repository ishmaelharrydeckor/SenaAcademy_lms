import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // 1. Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Limit to 5 attempts per 10 minutes
    const limitCheck = isRateLimited(ip, 5, 10 * 60 * 1000);
    if (limitCheck.limited) {
      const waitMinutes = Math.ceil(limitCheck.resetMs / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${waitMinutes} minute(s) before trying again.` },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Access code is required.' }, { status: 400 });
    }

    // 3. Call the security definer RPC function to verify code
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
