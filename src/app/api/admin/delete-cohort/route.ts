import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

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

    // 3. Parse action parameters
    const { cohortId, action } = await request.json();
    if (!cohortId || !action || (action !== 'archive' && action !== 'delete')) {
      return NextResponse.json({ error: 'Bad Request: Missing cohortId or invalid action' }, { status: 400 });
    }

    // 4. Handle ARCHIVE action (low risk)
    if (action === 'archive') {
      console.log(`Archiving cohort ${cohortId}`);
      const { error: archiveError } = await supabaseAdmin
        .from('cohorts')
        .update({ is_archived: true })
        .eq('id', cohortId);

      if (archiveError) {
        return NextResponse.json({ error: 'Failed to archive cohort: ' + archiveError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Cohort archived successfully.' });
    }

    // 5. Handle DELETE action (cascading hard-delete transaction)
    console.log(`Executing transaction-safe cascading delete for cohort ${cohortId}`);

    // Step A: Fetch all student profiles in the cohort
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('cohort_id', cohortId)
      .eq('role', 'student');

    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch cohort students: ' + studentsError.message }, { status: 500 });
    }

    const studentIds = students ? students.map(s => s.id) : [];

    // Step B: Fetch and delete all R2 files associated with these students
    if (studentIds.length > 0) {
      const { data: submissions, error: subError } = await supabaseAdmin
        .from('submissions')
        .select('zip_file_url, pdf_file_url')
        .in('student_id', studentIds);

      if (subError) {
        return NextResponse.json({ error: 'Failed to fetch student submissions: ' + subError.message }, { status: 500 });
      }

      if (submissions && submissions.length > 0) {
        for (const sub of submissions) {
          // Delete ZIP file from R2
          if (sub.zip_file_url) {
            try {
              await s3.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME || 'submissions',
                Key: sub.zip_file_url,
              }));
            } catch (err) {
              console.error(`Failed to delete ZIP file ${sub.zip_file_url} from R2:`, err);
              // Rollback safety: exit early before running database deletions
              return NextResponse.json({ error: 'Failed to delete submission ZIP files from R2 storage. Transaction rolled back.' }, { status: 502 });
            }
          }
          // Delete PDF file from R2
          if (sub.pdf_file_url) {
            try {
              await s3.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME || 'submissions',
                Key: sub.pdf_file_url,
              }));
            } catch (err) {
              console.error(`Failed to delete PDF file ${sub.pdf_file_url} from R2:`, err);
              return NextResponse.json({ error: 'Failed to delete submission PDF files from R2 storage. Transaction rolled back.' }, { status: 502 });
            }
          }
        }
      }
    }

    // Step C: Run database cascading deletion transaction RPC
    const { error: dbError } = await supabaseAdmin.rpc('delete_cohort_db_cascade', {
      target_cohort_id: cohortId,
    });

    if (dbError) {
      console.error('Database cascade deletion transaction failed:', dbError.message);
      return NextResponse.json({ error: 'Database cascade transaction failed: ' + dbError.message }, { status: 500 });
    }

    // Step D: Delete the auth users from Supabase Auth
    if (studentIds.length > 0) {
      for (const studentId of studentIds) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(studentId);
        } catch (authErr: any) {
          console.error(`Failed to delete Supabase Auth user ${studentId}:`, authErr);
          // Don't fail the whole request since DB cascade succeeded, but log it
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Cohort and all associated student data permanently deleted.' });

  } catch (err: any) {
    console.error('Error in delete-cohort API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
