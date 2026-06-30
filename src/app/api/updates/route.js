import { NextResponse } from 'next/server';
import { addUpdate, editUpdate, deleteUpdate, snoozeTask } from '@/lib/excel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { project, ...updateData } = body;
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

    await addUpdate(project, updateData);
    // Automatically push the Next Update Due by 1 week (7 days)
    await snoozeTask(project, updateData.taskId, 7);
    
    return NextResponse.json({ success: true, update: updateData });
  } catch (error) {
    console.error('Failed to add update:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add update' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { project, ...updateData } = body;
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });

    await editUpdate(project, updateData);
    return NextResponse.json({ success: true, update: updateData });
  } catch (error) {
    console.error('Failed to edit update:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to edit update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const updateId = searchParams.get('updateId');
    
    if (!project || !updateId) {
      return NextResponse.json({ error: 'Project and updateId required' }, { status: 400 });
    }

    await deleteUpdate(project, updateId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete update:', error);
    if (error.code === 'EBUSY') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
  }
}
