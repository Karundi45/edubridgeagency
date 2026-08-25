import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'superadmin', 'editor'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary config missing' }, { status: 500 });
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    // Dynamic import for crypto
    const crypto = await import('crypto');
    const signature = crypto.createHash('sha1')
      .update(`folder=edubridge&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', 'edubridge');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData
    });

    const result = await uploadRes.json();
    
    if (!uploadRes.ok) {
      return NextResponse.json({ error: result.error?.message || 'Upload failed' }, { status: uploadRes.status });
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
