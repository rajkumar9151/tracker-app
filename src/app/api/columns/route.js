import { NextResponse } from 'next/server';
import { addColumnToExcel } from '@/lib/excel';
import { addColumnMetadata } from '@/lib/metadata';

export async function POST(request) {
  try {
    const { project, columnName, columnType, targetSheet = 'Tasks' } = await request.json();
    if (!project || !columnName || !columnType) {
      return NextResponse.json({ error: 'Project, columnName, and columnType required' }, { status: 400 });
    }

    await addColumnToExcel(project, columnName, targetSheet);
    await addColumnMetadata(project, columnName, columnType, targetSheet);

    return NextResponse.json({ success: true, columnName, columnType, targetSheet });
  } catch (error) {
    console.error('Failed to add column:', error);
    return NextResponse.json({ error: 'Failed to add column' }, { status: 500 });
  }
}
