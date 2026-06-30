import { NextResponse } from 'next/server';
import { closeTask } from '@/lib/excel';

export async function POST(request) {
  try {
    const { project, taskId } = await request.json();
    if (!project || !taskId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await closeTask(project, taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to close task:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to close task' }, { status: 500 });
  }
}
