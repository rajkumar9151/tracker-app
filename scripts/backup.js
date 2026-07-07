const fs = require('fs').promises;
const path = require('path');
const { Storage } = require('@google-cloud/storage');

// Try loading env vars from .env.local if present (useful for local testing)
try {
  const dotenv = require('dotenv');
  const envPath = path.join(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
} catch (e) {
  // If dotenv isn't installed or file isn't present, continue (metadata server handles it on GCP)
}

const bucketName = process.env.GCS_BUCKET_NAME;

async function runBackup() {
  console.log(`[${new Date().toISOString()}] Starting database backup...`);

  if (!bucketName) {
    console.error('Error: GCS_BUCKET_NAME environment variable is not defined.');
    process.exit(1);
  }

  const dbPath = path.join(process.cwd(), 'data', 'db.json');

  try {
    // 1. Read db.json
    await fs.access(dbPath);
    const content = await fs.readFile(dbPath, 'utf8');
    
    // Validate it's correct JSON
    JSON.parse(content);

    // 2. Initialize GCS Storage
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);

    // 3. Generate backup filename (e.g. backups/db-2026-07-07-16312345.json)
    const dateStr = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const backupFilename = `backups/db-${dateStr}-${timestamp}.json`;
    
    console.log(`Uploading backup to GCS: ${backupFilename}`);
    const file = bucket.file(backupFilename);
    await file.save(content, {
      metadata: { contentType: 'application/json' },
      resumable: false
    });
    console.log('Upload completed successfully.');

    // 4. Housekeeping: Keep only the last 30 backups
    console.log('Cleaning up old backups (keeping maximum of 30)...');
    const [files] = await bucket.getFiles({ prefix: 'backups/db-' });
    
    // Sort chronologically by filename (which starts with date-timestamp)
    files.sort((a, b) => a.name.localeCompare(b.name));

    if (files.length > 30) {
      const deleteCount = files.length - 30;
      console.log(`Found ${files.length} backups. Deleting oldest ${deleteCount} backups...`);
      
      for (let i = 0; i < deleteCount; i++) {
        const fileToDelete = files[i];
        console.log(`Deleting old backup: ${fileToDelete.name}`);
        await fileToDelete.delete();
      }
      console.log('Cleanup completed.');
    } else {
      console.log(`Found ${files.length} backups. No cleanup needed.`);
    }

    console.log('Database backup process completed successfully.');
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

runBackup();
