#!/usr/bin/env python3
"""Build the bundled scripture.db (SQLite) from the validated translation JSONs.

Run parse_usfm.py first. Output: scripture.db next to this script's data dir.
Schema:
  translations(id, code, name)
  books(id, translation_code, code, name, position)
  verses(translation_code, book_code, chapter, verse, text)  -- verse=0 rows
    never occur; edition-omitted verses keep their number with empty text so
    numbering stays aligned with print editions (reader skips empty rows).
  meta(key, value) -- counts + sha256 of source JSONs for audit.
"""
import hashlib, json, os, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
NAMES = {"KJV": "King James Version", "WEB": "World English Bible", "ASV": "American Standard Version"}

def main():
    db_path = os.path.join(HERE, "scripture.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    db = sqlite3.connect(db_path)
    c = db.cursor()
    c.executescript("""
      CREATE TABLE translations (code TEXT PRIMARY KEY, name TEXT NOT NULL);
      CREATE TABLE books (translation_code TEXT NOT NULL, code TEXT NOT NULL,
                          name TEXT NOT NULL, position INTEGER NOT NULL,
                          PRIMARY KEY (translation_code, code));
      CREATE TABLE verses (translation_code TEXT NOT NULL, book_code TEXT NOT NULL,
                           chapter INTEGER NOT NULL, verse INTEGER NOT NULL,
                           text TEXT NOT NULL,
                           PRIMARY KEY (translation_code, book_code, chapter, verse));
      CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    """)
    for code, name in NAMES.items():
        src = os.path.join(HERE, f"{code.lower()}.json")
        raw = open(src, "rb").read()
        data = json.loads(raw)
        c.execute("INSERT INTO translations VALUES (?,?)", (code, name))
        nv = 0
        for pos, book in enumerate(data["books"]):
            c.execute("INSERT INTO books VALUES (?,?,?,?)", (code, book["code"], book["name"], pos))
            for ch_i, chapter in enumerate(book["chapters"], 1):
                for v in chapter:
                    c.execute("INSERT INTO verses VALUES (?,?,?,?,?)",
                              (code, book["code"], ch_i, v["v"], v["text"]))
                    nv += 1
        c.execute("INSERT INTO meta VALUES (?,?)", (f"{code}_sha256", hashlib.sha256(raw).hexdigest()))
        c.execute("INSERT INTO meta VALUES (?,?)", (f"{code}_verse_slots", str(nv)))
        print(f"{code}: {nv} verse rows")
    db.commit()
    db.execute("VACUUM")
    db.close()
    print(f"scripture.db: {os.path.getsize(db_path) / 1e6:.1f} MB")

if __name__ == "__main__":
    main()
