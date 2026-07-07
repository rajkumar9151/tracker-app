import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Initialize database file with empty structure if it doesn't exist
async function initDb() {
  const dir = path.dirname(dbPath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // Ignore error if dir exists
  }
  
  try {
    await fs.access(dbPath);
  } catch {
    const initialData = {
      projects: {},
      metadata: {},
      tasks: {}
    };
    await fs.writeFile(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export async function getDb() {
  await initDb();
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return { projects: {}, metadata: {}, tasks: {} };
  }
}

export async function saveDb(data) {
  await initDb();
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB:', error);
    throw error;
  }
}
