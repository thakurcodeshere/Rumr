import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { SCHEMA_SQL } from './schema-sql.js';

// Ensure the database directory exists
const dbDir = path.dirname(CONFIG.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export function initDatabase(dbPath = CONFIG.DB_PATH): Database.Database {
  const db = new Database(dbPath);

  // Performance and integrity pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  // Run schema DDL
  db.exec(SCHEMA_SQL);

  // Seed baseline topics and candidates
  seedDatabase(db);

  return db;
}

export const db = initDatabase();
