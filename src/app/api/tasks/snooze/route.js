import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { addDays, parseISO, format } from 'date-fns';

export async function POST(request) {
  try {
    const { project, taskId, days = 1 } = await request.json();
    if (!project || !taskId) {
      return NextResponse.json({ error: 'Project and taskId required' }, { status: 400 });
    }

    const taskRef = db.collection('projects').doc(project).collection('tasks').doc(taskId);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = doc.data();
    let currentDate = task['Due Date'] ? parseISO(task['Due Date']) : new Date();
    const newDate = addDays(currentDate, days);
    
    await taskRef.update({
      'Due Date': format(newDate, 'yyyy-MM-dd')
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to snooze task:', error);
    return NextResponse.json({ error: 'Failed to snooze task' }, { status: 500 });
  }
}
