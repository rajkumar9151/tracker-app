import { NextResponse } from 'next/server';
import { addTask, updateTask, deleteTask } from '@/lib/excel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { project, ...taskData } = body;
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

    await addTask(project, taskData);
    return NextResponse.json({ success: true, task: taskData });
  } catch (error) {
    console.error('Failed to add task:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add task' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { project, ...taskData } = body;
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

    await updateTask(project, taskData);
    return NextResponse.json({ success: true, task: taskData });
  } catch (error) {
    console.error('Failed to update task:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
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

    await deleteTask(project, taskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete task:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
