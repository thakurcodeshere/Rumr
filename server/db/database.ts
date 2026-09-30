import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { CONFIG } from '../config.js';
import { DatabaseAdapter } from './interface.js';
import { SupabaseDatabase } from './supabase-db.js';
import { SqliteDatabase } from './sqlite-db.js';
import { getSupabaseClient, isSupabaseConfigured, validateProductionSupabaseConfig } from './supabase.js';
import { SCHEMA_SQL } from './schema-sql.js';

const require = createRequire(import.meta.url);

export function createDatabaseAdapter(): DatabaseAdapter {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  if (isProduction) {
    // Fail closed: production MUST have valid Supabase credentials and MUST NOT fall back to SQLite
    validateProductionSupabaseConfig();
    console.log('🔒 [RUMR_DB] Initializing authoritative Supabase PostgreSQL production adapter...');
    const client = getSupabaseClient();
    return new SupabaseDatabase(client);
  }

  // Development / Test Environments
  // Prefer Supabase if explicitly configured and not overridden by DB_PROVIDER=sqlite
  if (isSupabaseConfigured() && process.env.DB_PROVIDER !== 'sqlite') {
    console.log('🌐 [RUMR_DB] Initializing Supabase PostgreSQL adapter for development/test...');
    return new SupabaseDatabase(getSupabaseClient());
  }

  // Fallback to SQLite strictly for local dev/testing
  console.log('📦 [RUMR_DB] Initializing local SQLite adapter (DEV/TEST ONLY)...');
  const dbDir = path.dirname(CONFIG.DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const Database = require('better-sqlite3');
  const sqlite = new Database(CONFIG.DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.exec(SCHEMA_SQL);

  return new SqliteDatabase(sqlite);
}

export const db: DatabaseAdapter = createDatabaseAdapter();

export async function pingDatabase() {
  return db.ping();
}

export * from './interface.js';
export * from './types.js';
