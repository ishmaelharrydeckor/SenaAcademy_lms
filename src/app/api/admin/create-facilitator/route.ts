import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendFacilitatorOnboardingEmail } from '@/lib/mail';

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
    const { fullName, email } = await request.json();
    if (!fullName || !email) {
      return NextResponse.json({ error: 'Bad Request: Missing fullName or email' }, { status: 400 });
    }

    console.log(`Admin creating facilitator account for: ${email}`);

    // 4. Create user in Supabase Auth via admin API
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'facilitator',
      },
    });

    if (authErr || !authData?.user) {
      console.error('Failed to create auth user:', authErr?.message);
      return NextResponse.json({ error: 'Failed to create user in authentication provider: ' + (authErr?.message || 'Unknown error') }, { status: 400 });
    }

    const facilitatorId = authData.user.id;

    // 5. Ensure profile role is set to facilitator (handles trigger conflicts or delays)
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: facilitatorId,
        email: email,
        full_name: fullName,
        role: 'facilitator',
      });

    if (profileErr) {
      console.error('Failed to upsert profile:', profileErr.message);
      // Clean up orphaned auth user if database profile insertion fails
      await supabaseAdmin.auth.admin.deleteUser(facilitatorId);
      return NextResponse.json({ error: 'Failed to initialize database profile record' }, { status: 500 });
    }

    // 6. Generate activation / setup password recovery link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${appUrl}/reset-password`,
      },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('Failed to generate onboarding activation link:', linkErr?.message);
      return NextResponse.json({ error: 'Account created, but failed to generate onboarding activation token' }, { status: 500 });
    }

    const activationLink = linkData.properties.action_link;

    // 7. Send onboarding email
    const emailResult = await sendFacilitatorOnboardingEmail(email, fullName, activationLink);
    if (!emailResult.success) {
      console.error('Failed to send onboarding email:', emailResult.error);
      return NextResponse.json({ 
        success: true, 
        message: 'Facilitator account created, but SMTP failed to deliver onboarding invitation email. You can verify and email a password recovery link manually.',
        email_sent: false 
      });
    }

    return NextResponse.json({ success: true, message: 'Facilitator account successfully created and activation email dispatched.', email_sent: true });

  } catch (err: any) {
    console.error('Error in create-facilitator API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
