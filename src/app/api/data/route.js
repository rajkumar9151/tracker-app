import { NextResponse } from 'next/server';
import { getTrackerData } from '@/lib/excel';
import { getColumnMetadata } from '@/lib/metadata';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });
    
    const data = await getTrackerData(project);
    const metadata = await getColumnMetadata(project);
    return NextResponse.json({ ...data, metadata });
  } catch (error) {
    console.error('Failed to get tracker data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
