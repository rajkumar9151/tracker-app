import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const { project, updateId, ...updateData } = await request.json();
    if (!project || !updateData.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.projectUpdates) db.projectUpdates = {};
    if (!db.projectUpdates[project]) db.projectUpdates[project] = [];

    db.projectUpdates[project].push({
      updateId: updateId || 'PUPD-' + Math.random().toString(36).substr(2, 9),
      ...updateData
    });

    await saveDb(db);

    return NextResponse.json({ success: true, projectUpdates: db.projectUpdates[project] });
  } catch (error) {
    console.error('Failed to add project update:', error);
    return NextResponse.json({ error: 'Failed to add project update' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { project, updateId, ...updateData } = await request.json();
    if (!project || !updateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.projectUpdates || !db.projectUpdates[project]) {
      return NextResponse.json({ error: 'Project updates not found' }, { status: 404 });
    }

    const updateIndex = db.projectUpdates[project].findIndex(u => u.updateId === updateId);
    if (updateIndex === -1) {
      return NextResponse.json({ error: 'Project update not found' }, { status: 404 });
    }

    db.projectUpdates[project][updateIndex] = { ...db.projectUpdates[project][updateIndex], ...updateData };
    await saveDb(db);

    return NextResponse.json({ success: true, projectUpdates: db.projectUpdates[project] });
  } catch (error) {
    console.error('Failed to edit project update:', error);
    return NextResponse.json({ error: 'Failed to edit project update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    const updateId = searchParams.get('updateId');

    if (!project || !updateId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.projectUpdates || !db.projectUpdates[project]) {
      return NextResponse.json({ error: 'Project updates not found' }, { status: 404 });
    }

    const updateIndex = db.projectUpdates[project].findIndex(u => u.updateId === updateId);
    if (updateIndex === -1) {
      return NextResponse.json({ error: 'Project update not found' }, { status: 404 });
    }

    db.projectUpdates[project].splice(updateIndex, 1);
    await saveDb(db);

    return NextResponse.json({ success: true, projectUpdates: db.projectUpdates[project] });
  } catch (error) {
    console.error('Failed to delete project update:', error);
    return NextResponse.json({ error: 'Failed to delete project update' }, { status: 500 });
  }
}
