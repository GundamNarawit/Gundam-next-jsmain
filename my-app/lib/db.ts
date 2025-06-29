import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({
    filename: './notes.db',
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      ip TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL
    );
  `);
  return db;
}
