import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function GET() {
  try {
    const db = await getDb();
    const projects = [];
    
    for (const name of Object.keys(db.projects || {})) {
      const tasks = db.tasks[name] || [];
      
      let stats = { total: 0, todo: 0, inProgress: 0, done: 0 };
      
      tasks.forEach(task => {
        stats.total++;
        if (task.Status === 'To Do') stats.todo++;
        else if (task.Status === 'In Progress') stats.inProgress++;
        else if (task.Status === 'Done' || task.Status === 'Closed') stats.done++;
      });
      
      projects.push({
        name,
        stats
      });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Failed to get projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { projectName, customColumns } = await request.json();
    if (!projectName) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    if (!db.projects) db.projects = {};
    if (!db.metadata) db.metadata = {};
    if (!db.tasks) db.tasks = {};

    db.projects[projectName] = {
      name: projectName,
      createdAt: new Date().toISOString()
    };

    db.metadata[projectName] = {
      columns: customColumns || []
    };

    if (!db.tasks[projectName]) {
      db.tasks[projectName] = [];
    }

    await saveDb(db);

    return NextResponse.json({ success: true, projectName });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');
    
    if (!projectName) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    }

    const db = await getDb();
    
    if (db.projects) delete db.projects[projectName];
    if (db.metadata) delete db.metadata[projectName];
    if (db.tasks) delete db.tasks[projectName];

    await saveDb(db);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
