import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { project, taskId, updateText, author } = await request.json();
    if (!project || !taskId || !updateText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const taskRef = db.collection('projects').doc(project).collection('tasks').doc(taskId);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = doc.data();
    const updates = task.updates || [];
    
    updates.push({
      text: updateText,
      author: author || 'Unknown',
      date: new Date().toISOString()
    });

    await taskRef.update({ updates });

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error('Failed to add update:', error);
    return NextResponse.json({ error: 'Failed to add update' }, { status: 500 });
  }
}
