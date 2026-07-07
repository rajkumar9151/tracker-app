import { NextResponse } from 'next/server';
import { getFileStream } from '@/lib/gcs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    const local = searchParams.get('local');

    if (!file && !local) {
      return NextResponse.json({ error: 'Missing file or local parameter' }, { status: 400 });
    }

    const isLocal = !!local;
    const key = isLocal ? local : file;

    const fileData = await getFileStream(key, isLocal);

    if (!fileData) {
      return new Response('File not found', { status: 404 });
    }

    // Stream the file back to the browser
    return new Response(fileData.stream, {
      headers: {
        'Content-Type': fileData.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(key.split('/').pop())}"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Attachments API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
