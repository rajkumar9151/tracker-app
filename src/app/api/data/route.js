import { NextResponse } from 'next/server';
import { getDb } from '@/lib/localdb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');
    if (!project) return NextResponse.json({ error: 'Project required' }, { status: 400 });
    
    const db = await getDb();
    
    const projMeta = (db.metadata && db.metadata[project]) || {};
    const customColumns = Array.isArray(projMeta) ? projMeta : (projMeta.columns || []);
    const updateColumns = projMeta.updateColumns || [];
    
    // To maintain backwards compatibility while adding new features, we pass the full types and options 
    // inside the metadata object, so the frontend can access metadata[col] for types (backwards compat)
    // and metadata.options[col] for options.
    const metadataObj = {
      ...(projMeta.types || {}),
      options: projMeta.options || {},
      aiPromptTemplate: db.metadata?.aiPromptTemplate
    };

    // For legacy projects where customColumns was just an array of strings in db.metadata[project]
    // metadataObj will just be empty types, defaulting to 'text' on frontend.

    const columns = [
      'Task Name',
      'Owner',
      'Status',
      'Priority',
      ...customColumns,
      'Created Date'
    ];

    const tasks = (db.tasks && db.tasks[project]) || [];
    const allUpdates = [];
    const rows = tasks.map(task => {
      if (task.updates && Array.isArray(task.updates)) {
        allUpdates.push(...task.updates);
      }
      return {
        id: task.id || task.ID || Math.random().toString(36).substr(2, 9),
        ...task
      };
    });

    const projectUpdates = (db.projectUpdates && db.projectUpdates[project]) || [];

    return NextResponse.json({ tasks: rows, columns, updateColumns, updates: allUpdates, projectUpdates, metadata: metadataObj });
  } catch (error) {
    console.error('Failed to get tracker data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
