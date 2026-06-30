import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { parseISO, isPast, isToday, startOfDay } from 'date-fns';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });
    
    const tasksSnapshot = await db.collection('projects').doc(project).collection('tasks').get();
    
    let dueTasksCount = 0;
    const now = new Date();
    const today = startOfDay(now);

    tasksSnapshot.forEach(doc => {
      const task = doc.data();
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
