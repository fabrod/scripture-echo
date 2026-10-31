/**
 * Read-only queries against the bundled scripture.db (validated KJV/WEB/ASV).
 * Schema: translations(code,name), books(translation_code, code, name, position),
 * verses(translation_code, book_code, chapter, verse, text).
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { TranslationCode } from './config';

export interface BookRow {
  code: string;
  name: string;
  position: number;
  chapters: number;
}

export interface VerseRow {
  verse: number;
  text: string;
}

export async function getBooks(
  db: SQLiteDatabase,
  translation: TranslationCode,
): Promise<BookRow[]> {
  return db.getAllAsync<BookRow>(
    `SELECT b.code AS code, b.name AS name, b.position AS position,
            (SELECT MAX(v.chapter) FROM verses v
              WHERE v.translation_code = b.translation_code AND v.book_code = b.code) AS chapters
       FROM books b
      WHERE b.translation_code = ?
      ORDER BY b.position`,
    [translation],
  );
}

export async function getBook(
  db: SQLiteDatabase,
  translation: TranslationCode,
  bookCode: string,
): Promise<BookRow | null> {
  const rows = await getBooks(db, translation);
  return rows.find((b) => b.code === bookCode) ?? null;
}

export async function getChapter(
  db: SQLiteDatabase,
  translation: TranslationCode,
  bookCode: string,
  chapter: number,
): Promise<VerseRow[]> {
  return db.getAllAsync<VerseRow>(
    `SELECT verse, text FROM verses
      WHERE translation_code = ? AND book_code = ? AND chapter = ?
      ORDER BY verse`,
    [translation, bookCode, chapter],
  );
}

export async function getVerse(
  db: SQLiteDatabase,
  translation: TranslationCode,
  bookCode: string,
  chapter: number,
  verse: number,
): Promise<VerseRow | null> {
  return db.getFirstAsync<VerseRow>(
    `SELECT verse, text FROM verses
      WHERE translation_code = ? AND book_code = ? AND chapter = ? AND verse = ?`,
    [translation, bookCode, chapter, verse],
  );
}

export interface SearchHit {
  book_code: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export async function searchVerses(
  db: SQLiteDatabase,
  translation: TranslationCode,
  query: string,
  limit = 60,
): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  return db.getAllAsync<SearchHit>(
    `SELECT v.book_code AS book_code, b.name AS book_name, v.chapter AS chapter,
            v.verse AS verse, v.text AS text
       FROM verses v JOIN books b
         ON b.translation_code = v.translation_code AND b.code = v.book_code
      WHERE v.translation_code = ? AND v.text LIKE ?
      ORDER BY b.position, v.chapter, v.verse
      LIMIT ?`,
    [translation, `%${q}%`, limit],
  );
}
