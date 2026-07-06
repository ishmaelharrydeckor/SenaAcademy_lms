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

    // 3. Parse input items
    const { items } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Bad Request: Missing or empty items list' }, { status: 400 });
    }

    console.log(`Admin ${user.email} generating and sending ${items.length} access codes.`);

    const generatedResults = [];

    // Loop through each code request
    for (const item of items) {
      const { email, cohortId, expiry } = item;
      if (!email || !cohortId) continue;

      // Generate a unique access code
      const generatedCode = 'SENA-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const expiresAt = expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Insert access code record
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
        console.error(`Failed to generate code for ${email}:`, codeError.message);
        continue;
      }

      // Fetch Cohort name for email context
      const { data: cohortData } = await supabaseAdmin
        .from('cohorts')
        .select('name')
        .eq('id', cohortId)
        .single();
      
      const cohortName = cohortData?.name || 'Curriculum Cohort';

      // Send the email
      const emailResult = await sendAccessCodeEmail(email, 'Trainee', generatedCode, cohortName);
      
      generatedResults.push({
        email,
        code: generatedCode,
        email_sent: emailResult.success,
      });
    }

    return NextResponse.json({
      message: `Successfully processed ${generatedResults.length} access codes.`,
      results: generatedResults,
    });

  } catch (err: any) {
    console.error('Error in manual generate-access-code API:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
