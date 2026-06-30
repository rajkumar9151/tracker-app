import fs from 'fs';
import path from 'path';

function getMetaPath(projectName) {
  const dataDir = process.env.DATA_DIR || process.cwd();
  return path.join(dataDir, `${projectName}_metadata.json`);
}

export async function getColumnMetadata(projectName) {
  const metaPath = getMetaPath(projectName);
  if (fs.existsSync(metaPath)) {
    const raw = fs.readFileSync(metaPath, 'utf8');
    return JSON.parse(raw);
  }
  return {};
}

export async function addColumnMetadata(projectName, columnName, columnType, targetSheet = 'Tasks') {
  const metaPath = getMetaPath(projectName);
  let metadata = {};
  if (fs.existsSync(metaPath)) {
    metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  }
  
  const key = targetSheet === 'Updates' ? `Updates_${columnName}` : columnName;
  metadata[key] = columnType; // e.g., 'text', 'date', 'attachment'
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
}

export async function initProjectMetadata(projectName, customColumns) {
  const metadata = {};
  // For new projects, assume customColumns are text unless specified otherwise.
  // Actually, in the old flow we just passed strings. So default them to text.
  customColumns.forEach(col => {
    metadata[col] = 'text';
  });
  const metaPath = getMetaPath(projectName);
  if (!fs.existsSync(metaPath)) {
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  }
}
