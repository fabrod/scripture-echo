/**
 * User data — bookmarks, favorites, listening history, settings.
 * Lives in its own on-device database (user.db). Nothing here ever leaves
 * the phone: no accounts, no sync, no tracking (see PRIVACY_POLICY.md).
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { TranslationCode } from './config';

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function userDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await openDatabaseAsync('user.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          translation TEXT NOT NULL, book_code TEXT NOT NULL, book_name TEXT NOT NULL,
          chapter INTEGER NOT NULL, verse INTEGER NOT NULL, created_at INTEGER NOT NULL,
          UNIQUE(translation, book_code, chapter, verse));
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          translation TEXT NOT NULL, book_code TEXT NOT NULL, book_name TEXT NOT NULL,
          chapter INTEGER NOT NULL, verse INTEGER NOT NULL, created_at INTEGER NOT NULL,
          UNIQUE(translation, book_code, chapter, verse));
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          translation TEXT NOT NULL, book_code TEXT NOT NULL, book_name TEXT NOT NULL,
          chapter INTEGER NOT NULL, position_sec REAL NOT NULL DEFAULT 0,
          duration_sec REAL NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL,
          UNIQUE(translation, book_code, chapter));
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      `);
      return db;
    })();
  }
  return dbPromise;
}

export interface SavedRef {
  id: number;
  translation: TranslationCode;
  book_code: string;
  book_name: string;
  chapter: number;
  verse: number;
  created_at: number;
}

export interface HistoryEntry {
  id: number;
  translation: TranslationCode;
  book_code: string;
  book_name: string;
  chapter: number;
  position_sec: number;
  duration_sec: number;
  updated_at: number;
}

type Table = 'bookmarks' | 'favorites';

async function listSaved(table: Table): Promise<SavedRef[]> {
  const db = await userDb();
  return db.getAllAsync<SavedRef>(
    `SELECT * FROM ${table} ORDER BY created_at DESC`,
  );
}

async function toggleSaved(
  table: Table,
  ref: Omit<SavedRef, 'id' | 'created_at'>,
): Promise<boolean> {
  const db = await userDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM ${table} WHERE translation = ? AND book_code = ? AND chapter = ? AND verse = ?`,
    [ref.translation, ref.book_code, ref.chapter, ref.verse],
  );
  if (existing) {
    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [existing.id]);
    return false;
  }
  await db.runAsync(
    `INSERT INTO ${table} (translation, book_code, book_name, chapter, verse, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [ref.translation, ref.book_code, ref.book_name, ref.chapter, ref.verse, Date.now()],
  );
  return true;
}

async function isSaved(
  table: Table,
  translation: TranslationCode,
  bookCode: string,
  chapter: number,
  verse: number,
): Promise<boolean> {
  const db = await userDb();
  const row = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM ${table} WHERE translation = ? AND book_code = ? AND chapter = ? AND verse = ?`,
    [translation, bookCode, chapter, verse],
  );
  return !!row;
}

export const listBookmarks = () => listSaved('bookmarks');
export const listFavorites = () => listSaved('favorites');
export const toggleBookmark = (r: Omit<SavedRef, 'id' | 'created_at'>) =>
  toggleSaved('bookmarks', r);
export const toggleFavorite = (r: Omit<SavedRef, 'id' | 'created_at'>) =>
  toggleSaved('favorites', r);
export const isBookmarked = (t: TranslationCode, b: string, c: number, v: number) =>
  isSaved('bookmarks', t, b, c, v);
export const isFavorite = (t: TranslationCode, b: string, c: number, v: number) =>
  isSaved('favorites', t, b, c, v);

export async function recordHistory(
  entry: Omit<HistoryEntry, 'id' | 'updated_at'>,
): Promise<void> {
  const db = await userDb();
  await db.runAsync(
    `INSERT INTO history (translation, book_code, book_name, chapter, position_sec, duration_sec, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(translation, book_code, chapter)
     DO UPDATE SET position_sec = excluded.position_sec,
                   duration_sec = excluded.duration_sec,
                   updated_at = excluded.updated_at`,
    [
      entry.translation,
      entry.book_code,
      entry.book_name,
      entry.chapter,
      entry.position_sec,
      entry.duration_sec,
      Date.now(),
    ],
  );
}

export async function listHistory(limit = 20): Promise<HistoryEntry[]> {
  const db = await userDb();
  return db.getAllAsync<HistoryEntry>(
    `SELECT * FROM history ORDER BY updated_at DESC LIMIT ?`,
    [limit],
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await userDb();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await userDb();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}
