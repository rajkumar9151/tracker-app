import { NextResponse } from 'next/server';
import { snoozeTask } from '@/lib/excel';

export async function POST(request) {
  try {
    const { project, taskId } = await request.json();
    if (!project || !taskId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await snoozeTask(project, taskId, 7);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to snooze task:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to snooze task' }, { status: 500 });
  }
}
