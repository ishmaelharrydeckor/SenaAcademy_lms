import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { supabase } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rateLimit';

// Initialize S3 Client for Cloudflare R2
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
    const limitCheck = isRateLimited(ip, 10, 5 * 60 * 1000); // 10 uploads per 5 mins
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // 2. Authenticate user via bearer token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 3. Parse and validate body
    const body = await request.json();
    const { fileName, contentType, declaredSize } = body;

    if (!fileName || !contentType || typeof declaredSize !== 'number') {
      return NextResponse.json({ error: 'Bad Request: Missing metadata' }, { status: 400 });
    }

    // 4. Enforce server-side size limit (25MB cap)
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (declaredSize > MAX_SIZE) {
      return NextResponse.json({ error: 'Payload Too Large: File exceeds 25MB limit' }, { status: 413 });
    }

    // Enforce file extension check
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext !== 'zip' && ext !== 'pdf') {
      return NextResponse.json({ error: 'Unsupported Media Type: Only ZIP or PDF files allowed' }, { status: 415 });
    }

    // 5. Generate unique object key
    const uniqueId = Math.random().toString(36).substring(2, 11);
    const objectKey = `submissions/${user.id}/${uniqueId}_${fileName}`;
    const bucketName = process.env.R2_BUCKET_NAME || '';

    // 6. Generate Presigned URL (expiring in 10 minutes / 600 seconds)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

    return NextResponse.json({
      uploadUrl,
      objectKey,
    });

  } catch (err: any) {
    console.error('Error generating upload URL:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
