import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });
    
    const metadataDoc = await db.collection('metadata').doc(project).get();
    const customColumns = metadataDoc.exists ? metadataDoc.data().columns || [] : [];
    
    const columns = [
      'Task Name',
      'Owner',
      'Status',
      'Priority',
      ...customColumns,
      'Created Date'
    ];

    const tasksSnapshot = await db.collection('projects').doc(project).collection('tasks').get();
    const rows = [];
    tasksSnapshot.forEach(doc => {
      const data = doc.data();
      rows.push({
        id: doc.id,
        ...data
      });
    });

    return NextResponse.json({ rows, columns, metadata: customColumns });
  } catch (error) {
    console.error('Failed to get tracker data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
