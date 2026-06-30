import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { project, taskId } = await request.json();
    if (!project || !taskId) {
      return NextResponse.json({ error: 'Project and taskId required' }, { status: 400 });
    }

    await db.collection('projects').doc(project).collection('tasks').doc(taskId).update({
      Status: 'Closed'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to close task:', error);
    return NextResponse.json({ error: 'Failed to close task' }, { status: 500 });
  }
}
