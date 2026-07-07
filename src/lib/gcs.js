import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import path from 'path';

const bucketName = process.env.GCS_BUCKET_NAME;

// Check if GCS should be used.
export const isGcsEnabled = () => {
  return !!bucketName;
};

/**
 * Uploads a file to GCS (or local fallback if GCS is unavailable or not set up)
 * @param {ArrayBuffer|Buffer} buffer - File data
 * @param {string} filename - Target filename (prefixed with task/timestamp for uniqueness)
 * @param {string} mimeType - File mime type
 * @returns {Promise<{success: boolean, url: string}>}
 */
export async function uploadFile(buffer, filename, mimeType) {
  const cleanFilename = sanitizeFilename(filename);

  if (isGcsEnabled()) {
    try {
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`attachments/${cleanFilename}`);

      await file.save(Buffer.from(buffer), {
        metadata: { contentType: mimeType },
        resumable: false
      });

      console.log(`Uploaded file to GCS: attachments/${cleanFilename}`);
      return { 
        success: true, 
        url: `/api/attachments?file=${encodeURIComponent(`attachments/${cleanFilename}`)}` 
      };
    } catch (error) {
      console.warn('GCS upload failed, falling back to local filesystem storage:', error.message);
    }
  }

  // Local filesystem fallback (useful for local development or if GCS is offline)
  try {
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filePath = path.join(uploadsDir, cleanFilename);
    await fs.writeFile(filePath, Buffer.from(buffer));
    
    console.log(`Saved file locally: data/uploads/${cleanFilename}`);
    return { 
      success: true, 
      url: `/api/attachments?local=${encodeURIComponent(cleanFilename)}` 
    };
  } catch (error) {
    console.error('Local fallback file upload failed:', error);
    throw new Error('Failed to save file');
  }
}

/**
 * Gets a file read stream from GCS or the local filesystem
 * @param {string} key - The GCS path (e.g. attachments/xxx) or local filename
 * @param {boolean} isLocal - If true, reads from local filesystem uploads folder
 * @returns {Promise<{stream: ReadableStream, mimeType: string}|null>}
 */
export async function getFileStream(key, isLocal = false) {
  if (isLocal) {
    try {
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
      const cleanKey = sanitizeFilename(key);
      const filePath = path.join(uploadsDir, cleanKey);
      
      await fs.access(filePath);
      
      const stream = require('fs').createReadStream(filePath);
      return { 
        stream, 
        mimeType: getMimeTypeFromExt(cleanKey) 
      };
    } catch (e) {
      console.warn(`Local file not found or inaccessible: ${key}`, e.message);
      return null;
    }
  }

  if (isGcsEnabled()) {
    try {
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(key);

      const [exists] = await file.exists();
      if (!exists) {
        console.warn(`GCS file not found: ${key}`);
        return null;
      }

      const [metadata] = await file.getMetadata();
      const stream = file.createReadStream();

      return { 
        stream, 
        mimeType: metadata.contentType || 'application/octet-stream' 
      };
    } catch (error) {
      console.error(`GCS file fetch failed for ${key}:`, error);
      return null;
    }
  }

  return null;
}

/**
 * Uploads a database backup file directly to GCS
 * @param {string} fileContent - Stringified JSON database
 * @param {string} filename - Target path in bucket (e.g. backups/db-xxx.json)
 */
export async function uploadBackup(fileContent, filename) {
  if (!isGcsEnabled()) {
    throw new Error('GCS is not configured. Cannot perform backup upload.');
  }

  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  await file.save(fileContent, {
    metadata: { contentType: 'application/json' },
    resumable: false
  });
}

/**
 * Lists backup files in the bucket
 * @returns {Promise<Array>} List of file objects
 */
export async function listBackups() {
  if (!isGcsEnabled()) return [];

  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const [files] = await bucket.getFiles({ prefix: 'backups/' });
  return files;
}

// Helpers
function sanitizeFilename(filename) {
  // Prevent directory traversal attacks and replace spaces/weird chars
  return filename
    .replace(/[/\\]/g, '') // remove slashes
    .replace(/\s+/g, '_'); // replace spaces with underscores
}

function getMimeTypeFromExt(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.zip': 'application/zip'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
