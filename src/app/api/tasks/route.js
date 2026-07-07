import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { project, ...taskData } = body;
    if (!project || Object.keys(taskData).length === 0) {
      return NextResponse.json({ error: 'Project and taskData required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.tasks) db.tasks = {};
    if (!db.tasks[project]) db.tasks[project] = [];

    // Unique ID is already passed from frontend, but ensure it's there
    if (!taskData.id && !taskData.ID) {
      taskData.ID = 'TSK-' + Math.random().toString(36).substr(2, 9);
      taskData.id = taskData.ID;
    }

    db.tasks[project].push(taskData);
    await saveDb(db);

    return NextResponse.json({ success: true, task: taskData });
  } catch (error) {
    console.error('Failed to add task:', error);
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { project, taskId, ...taskData } = await request.json();
    if (!project || !taskId || Object.keys(taskData).length === 0) {
      return NextResponse.json({ error: 'Project, taskId, and taskData required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.tasks || !db.tasks[project]) {
      return NextResponse.json({ error: 'Project tasks not found' }, { status: 404 });
    }

    const taskIndex = db.tasks[project].findIndex(t => t.id === taskId || t.ID === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Merge existing task data with updates
    db.tasks[project][taskIndex] = { ...db.tasks[project][taskIndex], ...taskData };
    await saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const taskId = searchParams.get('taskId');

    if (!project || !taskId) {
      return NextResponse.json({ error: 'Project and taskId required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.tasks || !db.tasks[project]) {
      return NextResponse.json({ error: 'Project tasks not found' }, { status: 404 });
    }

    const taskIndex = db.tasks[project].findIndex(t => t.id === taskId || t.ID === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Remove task
    db.tasks[project].splice(taskIndex, 1);
    await saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
