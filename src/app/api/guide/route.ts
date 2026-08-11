import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'ai-prompt-guide.pdf');
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Guide PDF not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="The-Non-Coder-Guide-to-AI.pdf"',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving guide PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
