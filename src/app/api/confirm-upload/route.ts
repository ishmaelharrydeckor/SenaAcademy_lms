import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

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
    // 1. Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitCheck = isRateLimited(ip, 15, 5 * 60 * 1000); // 15 calls per 5 mins
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // 2. Authenticate user
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 3. Parse body
    const { objectKey } = await request.json();
    if (!objectKey) {
      return NextResponse.json({ error: 'Bad Request: Missing object key' }, { status: 400 });
    }

    // Enforce that the user is verifying their own upload folder
    if (!objectKey.startsWith(`submissions/${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden: Cannot access other student folders' }, { status: 403 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || '';

    // 4. Retrieve object metadata from R2 (HeadObject)
    let size = 0;
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });
      const metadata = await s3.send(headCommand);
      size = metadata.ContentLength || 0;
    } catch (err: any) {
      console.error('Error fetching object head metadata:', err);
      return NextResponse.json({ error: 'Not Found: Uploaded file not found in storage' }, { status: 404 });
    }

    // 5. Enforce size cap post-upload
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (size > MAX_SIZE) {
      // Delete object immediately
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        });
        await s3.send(deleteCommand);
      } catch (delErr) {
        console.error('Error deleting oversized object:', delErr);
      }
      return NextResponse.json({ error: 'Payload Too Large: Uploaded file size exceeds 25MB limit' }, { status: 413 });
    }

    return NextResponse.json({ success: true, size });

  } catch (err: any) {
    console.error('Error in confirm upload:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
