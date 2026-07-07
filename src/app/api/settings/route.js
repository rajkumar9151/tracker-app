import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/localdb';

export async function POST(request) {
  try {
    const settingsUpdates = await request.json();

    const db = await getDb();
    if (!db.metadata) db.metadata = {};

    db.metadata = { ...db.metadata, ...settingsUpdates };
    await saveDb(db);

    return NextResponse.json({ success: true, metadata: db.metadata });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
