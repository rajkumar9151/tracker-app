import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const snapshot = await db.collection('projects').get();
    const projects = [];
    
    for (const doc of snapshot.docs) {
      const name = doc.id;
      const tasksSnapshot = await db.collection('projects').doc(name).collection('tasks').get();
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      tasksSnapshot.forEach(taskDoc => {
        totalTasks++;
        if (taskDoc.data().Status === 'Closed') {
          completedTasks++;
        }
      });
      
      projects.push({
        name,
        totalTasks,
        completedTasks,
        progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
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
    
    await db.collection('projects').doc(projectName).set({
      name: projectName,
      createdAt: new Date().toISOString()
    });

    await db.collection('metadata').doc(projectName).set({
      columns: customColumns || []
    });

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

    await db.collection('projects').doc(projectName).delete();
    await db.collection('metadata').doc(projectName).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
