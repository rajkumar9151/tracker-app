import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/gcs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate a unique filename using a timestamp prefix to prevent collisions
    const uniqueFilename = `${Date.now()}-${file.name}`;
    
    const uploadResult = await uploadFile(buffer, uniqueFilename, file.type);
    
    return NextResponse.json({ 
      success: true, 
      url: uploadResult.url 
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
