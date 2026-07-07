import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const { project, taskId, updateId, ...updateData } = await request.json();
    if (!project || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    if (!task.updates) task.updates = [];
    
    task.updates.push({
      updateId: updateId || 'UPD-' + Math.random().toString(36).substr(2, 9),
      taskId,
      ...updateData
    });

    await saveDb(db);

    return NextResponse.json({ success: true, updates: task.updates });
  } catch (error) {
    console.error('Failed to add update:', error);
    return NextResponse.json({ error: 'Failed to add update' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { project, taskId, updateId, ...updateData } = await request.json();
    if (!project || !taskId || !updateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    if (!task.updates) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    const updateIndex = task.updates.findIndex(u => u.updateId === updateId);
    if (updateIndex === -1) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    task.updates[updateIndex] = { ...task.updates[updateIndex], ...updateData };
    await saveDb(db);

    return NextResponse.json({ success: true, updates: task.updates });
  } catch (error) {
    console.error('Failed to edit update:', error);
    return NextResponse.json({ error: 'Failed to edit update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const taskId = searchParams.get('taskId');
    const updateId = searchParams.get('updateId');

    if (!project || !taskId || !updateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    if (!task.updates) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    const updateIndex = task.updates.findIndex(u => u.updateId === updateId);
    if (updateIndex === -1) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    task.updates.splice(updateIndex, 1);
    await saveDb(db);

    return NextResponse.json({ success: true, updates: task.updates });
  } catch (error) {
    console.error('Failed to delete update:', error);
    return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
  }
}
