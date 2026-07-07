import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';
import { addDays, parseISO, format } from 'date-fns';

export async function POST(request) {
  try {
    const { project, taskId, days = 1 } = await request.json();
    if (!project || !taskId) {
      return NextResponse.json({ error: 'Project and taskId required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.tasks || !db.tasks[project]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskIndex = db.tasks[project].findIndex(t => t.id === taskId || t.ID === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = db.tasks[project][taskIndex];
    let currentDate = task['Due Date'] ? parseISO(task['Due Date']) : new Date();
    const newDate = addDays(currentDate, days);
    
    task['Due Date'] = format(newDate, 'yyyy-MM-dd');
    
    await saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to snooze task:', error);
    return NextResponse.json({ error: 'Failed to snooze task' }, { status: 500 });
  }
}
