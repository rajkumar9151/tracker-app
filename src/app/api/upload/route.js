import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

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

    const taskRef = db.collection('projects').doc(project).collection('tasks').doc(taskId);
    const doc = await taskRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = doc.data();
    const attachments = task.attachments || [];
    attachments.push(attachment);

    await taskRef.update({ attachments });

    return NextResponse.json({ success: true, attachment: { name: file.name, type: file.type, size: file.size } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
