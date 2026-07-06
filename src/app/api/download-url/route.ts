import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { supabase } from '@/lib/supabase';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Fetch user role profile details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Forbidden: Profile not found' }, { status: 403 });
    }

    // 3. Extract objectKey from query params
    const { searchParams } = new URL(request.url);
    const objectKey = searchParams.get('key');
    if (!objectKey) {
      return NextResponse.json({ error: 'Bad Request: Missing object key' }, { status: 400 });
    }

    // 4. Validate Access Permissions
    // - Admin and Facilitators can read any submission.
    // - Students can only read files inside submissions/{user.id}/...
    const isAuthorized = 
      profile.role === 'admin' ||
      profile.role === 'facilitator' ||
      (profile.role === 'student' && objectKey.startsWith(`submissions/${user.id}/`));

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: You do not have permissions to access this file' }, { status: 403 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || '';

    // 5. Generate presigned GET URL (expires in 15 minutes / 900 seconds)
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return NextResponse.json({ downloadUrl });

  } catch (err: any) {
    console.error('Error in download URL API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
