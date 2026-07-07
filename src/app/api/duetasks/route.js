import { NextResponse } from 'next/server';
import { getDb } from '@/lib/localdb';
import { parseISO, isPast, isToday, startOfDay } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });
    
    const db = await getDb();
    const tasks = (db.tasks && db.tasks[project]) || [];
    
    let dueTasksCount = 0;
    
    tasks.forEach(task => {
      if (task.Status !== 'Closed' && task['Due Date']) {
        try {
          const dueDate = parseISO(task['Due Date']);
          if (isPast(dueDate) || isToday(dueDate)) {
            dueTasksCount++;
          }
        } catch (e) {
          // ignore invalid dates
        }
      }
    });

    return NextResponse.json({ count: dueTasksCount });
  } catch (error) {
    console.error('Failed to get due tasks count:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}
