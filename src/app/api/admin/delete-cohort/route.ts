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

    // Step B: Fetch student submission file URLs from database before we delete them
    let filesToDelete: string[] = [];
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
          if (sub.zip_file_url) filesToDelete.push(sub.zip_file_url);
          if (sub.pdf_file_url) filesToDelete.push(sub.pdf_file_url);
        }
      }
    }

    // Step C: Run database cascading deletion transaction RPC (DB DELETION FIRST)
    console.log(`Executing database cascade deletion transaction for cohort ${cohortId}`);
    const { error: dbError } = await supabaseAdmin.rpc('delete_cohort_db_cascade', {
      target_cohort_id: cohortId,
    });

    if (dbError) {
      console.error('Database cascade deletion transaction failed:', dbError.message);
      return NextResponse.json({ error: 'Database cascade transaction failed: ' + dbError.message }, { status: 500 });
    }

    // Step D: Delete R2 files from storage (R2 DELETION LAST)
    if (filesToDelete.length > 0) {
      console.log(`Deleting ${filesToDelete.length} files from R2 storage...`);
      for (const fileKey of filesToDelete) {
        try {
          await s3.send(new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || 'submissions',
            Key: fileKey,
          }));
        } catch (err: any) {
          // If R2 deletion fails, we log it for manual/orphan cleanup but do NOT fail the response
          console.error(`[ORPHANED FILE WARNING] Failed to delete file ${fileKey} from R2 storage:`, err.message || err);
        }
      }
    }

    // Step E: Delete the auth users from Supabase Auth
    if (studentIds.length > 0) {
      for (const studentId of studentIds) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(studentId);
        } catch (authErr: any) {
          console.error(`Failed to delete Supabase Auth user ${studentId} from Auth table:`, authErr);
          // Don't fail the request since database cascade already succeeded
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Cohort and all associated student data permanently deleted.' });

  } catch (err: any) {
    console.error('Error in delete-cohort API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
