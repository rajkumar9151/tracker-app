import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function GET() {
  try {
    const db = await getDb();
    
    // Initialize annual_planner namespace if it doesn't exist
    if (!db.annual_planner) {
      db.annual_planner = {
        goals: [],
        categories: [
          { id: 'marketing', label: 'Marketing', color: '#1d4ed8' },
          { id: 'operations', label: 'Operations', color: '#10b981' },
          { id: 'product', label: 'Product', color: '#f59e0b' },
          { id: 'research', label: 'Research', color: '#60a5fa' },
        ]
      };
      await saveDb(db);
    } else if (!db.annual_planner.categories) {
      db.annual_planner.categories = [
        { id: 'marketing', label: 'Marketing', color: '#1d4ed8' },
        { id: 'operations', label: 'Operations', color: '#10b981' },
        { id: 'product', label: 'Product', color: '#f59e0b' },
        { id: 'research', label: 'Research', color: '#60a5fa' },
      ];
      await saveDb(db);
    }
    
    return NextResponse.json(db.annual_planner);
  } catch (err) {
    console.error('Error in GET /api/annual-planner:', err);
    return NextResponse.json({ error: 'Failed to fetch planner data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = await getDb();
    
    if (!db.annual_planner) {
      db.annual_planner = { goals: [] };
    }
    
    const newGoal = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...data, // { title, description, month, category }
      status: 'pending' // default status
    };
    
    db.annual_planner.goals.push(newGoal);
    await saveDb(db);
    
    return NextResponse.json({ success: true, goal: newGoal });
  } catch (err) {
    console.error('Error in POST /api/annual-planner:', err);
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json(); // { id, title, description, month, category }
    const db = await getDb();
    
    if (!db.annual_planner) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const idx = db.annual_planner.goals.findIndex(g => g.id === data.id);
    if (idx === -1) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    
    db.annual_planner.goals[idx] = {
      ...db.annual_planner.goals[idx],
      ...data
    };
    
    await saveDb(db);
    return NextResponse.json({ success: true, goal: db.annual_planner.goals[idx] });
  } catch (err) {
    console.error('Error in PUT /api/annual-planner:', err);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const db = await getDb();
    if (!db.annual_planner) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    db.annual_planner.goals = db.annual_planner.goals.filter(g => g.id !== id);
    await saveDb(db);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in DELETE /api/annual-planner:', err);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
