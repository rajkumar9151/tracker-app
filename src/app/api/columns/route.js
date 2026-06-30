import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { project, columnName } = await request.json();
    if (!project || !columnName) {
      return NextResponse.json({ error: 'Project and column name required' }, { status: 400 });
    }

    const metadataRef = db.collection('metadata').doc(project);
    const doc = await metadataRef.get();
    
    let columns = [];
    if (doc.exists) {
      columns = doc.data().columns || [];
    }
    
    if (!columns.includes(columnName)) {
      columns.push(columnName);
      await metadataRef.set({ columns }, { merge: true });
    }

    return NextResponse.json({ success: true, columns });
  } catch (error) {
    console.error('Failed to add column:', error);
    return NextResponse.json({ error: 'Failed to add column' }, { status: 500 });
  }
}
