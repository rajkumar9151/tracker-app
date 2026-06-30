import { NextResponse } from 'next/server';
import { getDueTasks } from '@/lib/excel';

export async function GET() {
  try {
    const dueTasks = await getDueTasks();
    return NextResponse.json({ success: true, dueTasks });
  } catch (error) {
    console.error('Failed to get due tasks:', error);
    return NextResponse.json({ error: 'Failed to get due tasks' }, { status: 500 });
  }
}
