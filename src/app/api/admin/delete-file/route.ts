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

    // 2. Gate to Admin or Facilitator roles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'facilitator')) {
      return NextResponse.json({ error: 'Forbidden: Elevated permissions required' }, { status: 403 });
    }

    // 3. Parse request parameters
    const { submissionId, fileType } = await request.json();
    if (!submissionId || !fileType || (fileType !== 'zip' && fileType !== 'pdf')) {
      return NextResponse.json({ error: 'Bad Request: Missing submissionId or invalid fileType' }, { status: 400 });
    }

    // 4. Retrieve submission record
    const { data: submission, error: subError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (subError || !submission) {
      return NextResponse.json({ error: 'Submission record not found' }, { status: 404 });
    }

    // Find the file key to delete
    const fileKey = fileType === 'zip' ? submission.zip_file_url : submission.pdf_file_url;
    if (!fileKey) {
      return NextResponse.json({ error: 'File is already deleted or was never uploaded' }, { status: 400 });
    }

    // 5. Delete file from Cloudflare R2
    console.log(`Deleting ${fileType} object from R2: ${fileKey}`);
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'submissions',
        Key: fileKey,
      }));
    } catch (s3Err: any) {
      console.error('Failed to delete object from Cloudflare R2:', s3Err);
      return NextResponse.json({ error: 'Storage provider failed to delete file' }, { status: 502 });
    }

    // 6. Update database row flags
    const updatePayload: any = {};
    if (fileType === 'zip') {
      updatePayload.zip_file_url = null;
      updatePayload.zip_file_deleted = true;
    } else {
      updatePayload.pdf_file_url = null;
      updatePayload.pdf_file_deleted = true;
    }

    const { error: updateError } = await supabaseAdmin
      .from('submissions')
      .update(updatePayload)
      .eq('id', submissionId);

    if (updateError) {
      console.error('Failed to update submission delete flags:', updateError.message);
      return NextResponse.json({ error: 'Database update failed after file deletion' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully deleted ${fileType} file from storage.` });

  } catch (err: any) {
    console.error('Error in delete-file API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
