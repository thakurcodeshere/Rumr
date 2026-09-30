import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config.js';
import { SCHEMA_SQL } from './schema-sql.js';
import { seedDatabase } from './seed.js';

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  console.error('❌ Error: Seeding is forbidden in production environment.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = CONFIG.DB_PATH || path.resolve(__dirname, '../../data/rumr.db');

console.log(`🌱 Seeding local development database at ${dbPath}...`);
const sqlite = new Database(dbPath);
sqlite.exec(SCHEMA_SQL);
seedDatabase(sqlite);

const userCount = (sqlite.prepare('SELECT count(*) as c FROM users').get() as any)?.c || 0;
const topicCount = (sqlite.prepare('SELECT count(*) as c FROM topics').get() as any)?.c || 0;
console.log(`✅ Development database successfully seeded!`);
console.log(`   Users: ${userCount}`);
console.log(`   Topics: ${topicCount}`);
sqlite.close();
