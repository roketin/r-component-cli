import fs from 'fs';
import path from 'path';

/**
 * Ensure directory exists
 */
export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Write file with directory creation
 */
export function writeFile(filePath, content, overwrite = false) {
  if (fs.existsSync(filePath) && !overwrite) {
    return { written: false, reason: 'exists' };
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  return { written: true };
}

/**
 * Read file content
 */
export function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}
