import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const project = formData.get('project');
    const taskId = formData.get('taskId');

    if (!file || !project || !taskId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    const attachment = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: `data:${file.type};base64,${base64}`,
      uploadedAt: new Date().toISOString()
    };

    const db = await getDb();
    if (!db.tasks || !db.tasks[project]) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskIndex = db.tasks[project].findIndex(t => t.id === taskId || t.ID === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = db.tasks[project][taskIndex];
    if (!task.attachments) task.attachments = [];
    
    task.attachments.push(attachment);

    await saveDb(db);

    return NextResponse.json({ success: true, attachment: { name: file.name, type: file.type, size: file.size } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
