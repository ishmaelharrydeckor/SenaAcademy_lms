import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPasswordResetEmail } from '@/lib/mail';

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

    // 2. Gate to Admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse request parameters
    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Bad Request: Missing requestId' }, { status: 400 });
    }

    // 4. Retrieve reset request
    const { data: resetReq, error: reqError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !resetReq) {
      return NextResponse.json({ error: 'Password reset request not found' }, { status: 404 });
    }

    const email = resetReq.email;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 5. Generate secure Supabase Auth recovery action link
    console.log(`Generating password reset recovery link for: ${email}`);
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Failed to generate recovery link:', linkError?.message);
      return NextResponse.json({ error: 'Failed to generate recovery token from auth provider: ' + (linkError?.message || 'Unknown error') }, { status: 500 });
    }

    const actionLink = linkData.properties.action_link;

    // 6. Send Email containing the link
    const emailResult = await sendPasswordResetEmail(email, actionLink);
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to deliver recovery email via SMTP' }, { status: 502 });
    }

    // 7. Mark request resolved in database
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({
        status: 'resolved',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to mark reset request resolved:', updateError.message);
      // Succeeded sending email, so we return success anyway but log the DB error
    }

    return NextResponse.json({ success: true, message: 'Password recovery link successfully emailed to student.' });

  } catch (err: any) {
    console.error('Error in send-reset-link API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
