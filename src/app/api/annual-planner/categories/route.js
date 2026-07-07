import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const data = await request.json(); // { action: 'add'|'delete', payload: categoryId | newCategoryObj }
    const db = await getDb();
    
    if (!db.annual_planner) {
      db.annual_planner = { goals: [], categories: [] };
    }
    
    if (data.action === 'add') {
      const newCategory = {
        id: data.payload.id || data.payload.label.toLowerCase().replace(/\s+/g, '-'),
        label: data.payload.label,
        color: data.payload.color,
        icon: data.payload.icon || 'Circle'
      };
      
      db.annual_planner.categories = [...(db.annual_planner.categories || []), newCategory];
      await saveDb(db);
      
      return NextResponse.json({ success: true, category: newCategory });
    }
    
    if (data.action === 'delete') {
      db.annual_planner.categories = (db.annual_planner.categories || []).filter(c => c.id !== data.payload);
      
      // Optionally fallback any goals using this category to something else, or leave them
      // It's usually fine to leave the ID on the goal and let the frontend render a default color.
      
      await saveDb(db);
      return NextResponse.json({ success: true });
    }

    if (data.action === 'update') {
      const idx = (db.annual_planner.categories || []).findIndex(c => c.id === data.payload.id);
      if (idx !== -1) {
        db.annual_planner.categories[idx] = {
          ...db.annual_planner.categories[idx],
          label: data.payload.label,
          color: data.payload.color || db.annual_planner.categories[idx].color,
          icon: data.payload.icon || db.annual_planner.categories[idx].icon || 'Circle'
        };
        await saveDb(db);
        return NextResponse.json({ success: true, category: db.annual_planner.categories[idx] });
      }
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error in POST /api/annual-planner/categories:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
