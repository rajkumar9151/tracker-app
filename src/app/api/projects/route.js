import { NextResponse } from 'next/server';
import { getProjectsWithStats, initializeExcel, deleteProject } from '@/lib/excel';
import { initProjectMetadata } from '@/lib/metadata';

export async function GET() {
  try {
    const projects = await getProjectsWithStats();
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
    await initializeExcel(projectName, customColumns || []);
    await initProjectMetadata(projectName, customColumns || []);
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

    await deleteProject(projectName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete project:', error);
    if (error.code === 'EBUSY' || error.code === 'EPERM') {
      return NextResponse.json({ error: 'The Excel file is currently open. Please close it in Excel before modifying.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
