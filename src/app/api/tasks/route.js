import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { project, taskData } = await request.json();
    if (!project || !taskData) {
      return NextResponse.json({ error: 'Project and taskData required' }, { status: 400 });
    }

    const docRef = db.collection('projects').doc(project).collection('tasks').doc();
    taskData.id = docRef.id;
    await docRef.set(taskData);

    return NextResponse.json({ success: true, task: taskData });
  } catch (error) {
    console.error('Failed to add task:', error);
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { project, taskId, taskData } = await request.json();
    if (!project || !taskId || !taskData) {
      return NextResponse.json({ error: 'Project, taskId, and taskData required' }, { status: 400 });
    }

    await db.collection('projects').doc(project).collection('tasks').doc(taskId).update(taskData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
