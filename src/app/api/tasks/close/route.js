import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const { project, taskId } = await request.json();
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

    db.tasks[project][taskIndex].Status = 'Closed';
    
    await saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to close task:', error);
    return NextResponse.json({ error: 'Failed to close task' }, { status: 500 });
  }
}
