import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const { project, columnName, columnType = 'text', targetSheet = 'Tasks', options = '' } = await request.json();
    if (!project || !columnName) {
      return NextResponse.json({ error: 'Project and column name required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db.metadata) db.metadata = {};
    if (!db.metadata[project]) {
      db.metadata[project] = { columns: [], updateColumns: [], types: {}, options: {} };
    }
    
    const projMeta = db.metadata[project];
    if (!projMeta.updateColumns) projMeta.updateColumns = [];
    if (!projMeta.types) projMeta.types = {};
    if (!projMeta.options) projMeta.options = {};

    const targetList = targetSheet === 'Updates' ? projMeta.updateColumns : (projMeta.columns || []);
    
    if (!targetList.includes(columnName)) {
      targetList.push(columnName);
      
      if (targetSheet === 'Updates') {
        projMeta.updateColumns = targetList;
      } else {
        projMeta.columns = targetList;
      }
      
      // Save type and options (using a prefix if it's an update column to avoid collisions)
      const metaKey = targetSheet === 'Updates' ? `Updates_${columnName}` : columnName;
      projMeta.types[metaKey] = columnType;
      
      if (columnType === 'dropdown' && options) {
        projMeta.options[metaKey] = options.split(',').map(s => s.trim()).filter(Boolean);
      }

      await saveDb(db);
    }

    return NextResponse.json({ success: true, columns: projMeta.columns, updateColumns: projMeta.updateColumns });
  } catch (error) {
    console.error('Failed to add column:', error);
    return NextResponse.json({ error: 'Failed to add column' }, { status: 500 });
  }
}
