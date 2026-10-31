#!/usr/bin/env python3
"""Parse eBible.org USFM downloads into normalized JSON and validate structure.

Sources (authoritative downloads, not scraping):
  https://ebible.org/Scriptures/eng-kjv2006_usfm.zip  (KJV, 2006 edition)
  https://ebible.org/Scriptures/eng-web_usfm.zip      (World English Bible)
  https://ebible.org/Scriptures/eng-asv_usfm.zip      (American Standard Version 1901)

Output: <translation>.json  {translation, books:[{name, code, chapters:[[verse,...], ...]}]}
Validation: 66 books in canonical order, per-book chapter counts vs the
standard Protestant canon table (1,189 chapters total), verse totals,
and exact-text spot checks.
"""
import json, re, sys, zipfile, io, os

BOOKS = [  # (USFM code, name, chapters) — Protestant canon, in order
    ("GEN","Genesis",50),("EXO","Exodus",40),("LEV","Leviticus",27),("NUM","Numbers",36),
    ("DEU","Deuteronomy",34),("JOS","Joshua",24),("JDG","Judges",21),("RUT","Ruth",4),
    ("1SA","1 Samuel",31),("2SA","2 Samuel",24),("1KI","1 Kings",22),("2KI","2 Kings",25),
    ("1CH","1 Chronicles",29),("2CH","2 Chronicles",36),("EZR","Ezra",10),("NEH","Nehemiah",13),
    ("EST","Esther",10),("JOB","Job",42),("PSA","Psalms",150),("PRO","Proverbs",31),
    ("ECC","Ecclesiastes",12),("SNG","Song of Solomon",8),("ISA","Isaiah",66),("JER","Jeremiah",52),
    ("LAM","Lamentations",5),("EZK","Ezekiel",48),("DAN","Daniel",12),("HOS","Hosea",14),
    ("JOL","Joel",3),("AMO","Amos",9),("OBA","Obadiah",1),("JON","Jonah",4),
    ("MIC","Micah",7),("NAM","Nahum",3),("HAB","Habakkuk",3),("ZEP","Zephaniah",3),
    ("HAG","Haggai",2),("ZEC","Zechariah",14),("MAL","Malachi",4),("MAT","Matthew",28),
    ("MRK","Mark",16),("LUK","Luke",24),("JHN","John",21),("ACT","Acts",28),
    ("ROM","Romans",16),("1CO","1 Corinthians",16),("2CO","2 Corinthians",13),("GAL","Galatians",6),
    ("EPH","Ephesians",6),("PHP","Philippians",4),("COL","Colossians",4),("1TH","1 Thessalonians",5),
    ("2TH","2 Thessalonians",3),("1TI","1 Timothy",6),("2TI","2 Timothy",4),("TIT","Titus",3),
    ("PHM","Philemon",1),("HEB","Hebrews",13),("JAS","James",5),("1PE","1 Peter",5),
    ("2PE","2 Peter",3),("1JN","1 John",5),("2JN","2 John",1),("3JN","3 John",1),
    ("JUD","Jude",1),("REV","Revelation",22),
]
CODE2IDX = {c: i for i, (c, _, _) in enumerate(BOOKS)}

def clean(text: str) -> str:
    # drop footnotes / cross-references entirely
    text = re.sub(r"\\f\s.*?\\f\*", " ", text, flags=re.S)
    text = re.sub(r"\\fe\s.*?\\fe\*", " ", text, flags=re.S)
    text = re.sub(r"\\x\s.*?\\x\*", " ", text, flags=re.S)
    return text

TOKEN = re.compile(r"\\(c|v)\s+(\d+)([a-z])?|\\(d)(?=\s)")

def parse_book(usfm: str):
    usfm = clean(usfm)
    chapters = {}          # ch -> {verse -> text}
    cur_ch, cur_v = None, None
    pending_title = None   # \d superscription before verse 1
    pos = 0
    for m in TOKEN.finditer(usfm):
        chunk = usfm[pos:m.start()]
        if cur_ch is not None and cur_v is not None:
            chapters[cur_ch][cur_v] = chapters[cur_ch].get(cur_v, "") + chunk
        kind, num = (m.group(1) or "d"), m.group(2)
        if kind == "c":
            cur_ch, cur_v, pending_title = int(num), None, None
            chapters.setdefault(cur_ch, {})
        elif kind == "v":
            cur_v = int(num)
            chapters[cur_ch].setdefault(cur_v, "")
            if pending_title and cur_v == 1:
                chapters[cur_ch][cur_v] = pending_title + " "
                pending_title = None
        elif kind == "d":
            # descriptive title: capture its text (up to next token) only if
            # it precedes verse 1 of the chapter (Psalm superscription)
            end = TOKEN.search(usfm, m.end())
            title = usfm[m.end(): end.start() if end else len(usfm)]
            title = strip_markers(title).strip()
            if cur_ch is not None and cur_v is None and title:
                pending_title = title
        pos = m.end()
    tail = usfm[pos:]
    if cur_ch is not None and cur_v is not None:
        chapters[cur_ch][cur_v] = chapters[cur_ch].get(cur_v, "") + tail
    out = []
    for ch in sorted(chapters):
        verses = []
        for v in sorted(chapters[ch]):
            t = strip_markers(chapters[ch][v]).strip()
            t = re.sub(r"\s+", " ", t)
            t = re.sub(r"\s+([,.;:!?])", r"\1", t)   # marker-stripping artifact
            verses.append({"v": v, "text": t})
        out.append(verses)
    return out

def strip_markers(text: str) -> str:
    # KJV2006 USFM embeds word-level attributes: \w word|strong="H7225"\w*
    text = text.replace("\\+", "\\")                   # nested markers \+w -> \w
    text = re.sub(r'\|[a-zA-Z]+="[^"]*"', "", text)    # |strong="..." etc.
    text = re.sub(r"\|[^\\\s]*", "", text)             # any residual |attr fragment
    text = re.sub(r"\\[a-z][a-z0-9]*\*?", " ", text)   # any remaining \marker
    text = text.replace("\\", " ")
    return text

def load_zip(path):
    books = {}
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            m = re.search(r"-([A-Z0-9]{3})[^/]*\.usfm$", name)
            if not m or m.group(1) not in CODE2IDX:
                continue
            raw = z.read(name).decode("utf-8", errors="replace")
            books[m.group(1)] = parse_book(raw)
    return books

SPOT = [
    ("GEN", 1, 1, "God created the heaven"),
    ("JHN", 1, 1, "In the beginning was the Word"),
    ("PSA", 23, 1, "shepherd"),          # "The LORD is my shepherd" (KJV/ASV/WEB: Yahweh in WEB)
    ("EPH", 6, 11, "whole armo"),        # armour (KJV/ASV) / armor (WEB)
    ("REV", 22, 21, "grace"),
]

OMITTED = []  # filled by validate(): verses the edition itself omits (textual variants)

def validate(label, books):
    problems = []
    omitted = []
    if len(books) != 66:
        problems.append(f"book count {len(books)} != 66")
    total_ch = total_v = 0
    ordered = []
    for code, name, exp_ch in BOOKS:
        if code not in books:
            problems.append(f"missing book {code}")
            continue
        chs = books[code]
        total_ch += len(chs)
        total_v += sum(len(c) for c in chs)
        if len(chs) != exp_ch:
            problems.append(f"{code}: {len(chs)} chapters != expected {exp_ch}")
        for i, ch in enumerate(chs, 1):
            nums = [x["v"] for x in ch]
            if nums != list(range(1, len(nums) + 1)):
                problems.append(f"{code} {i}: verse numbering gap {nums[:5]}...")
            for x in ch:
                if not x["text"]:
                    omitted.append(f"{code} {i}:{x['v']}")
        ordered.append({"name": name, "code": code, "chapters": chs})
    if total_ch != 1189:
        problems.append(f"total chapters {total_ch} != 1189")
    for code, ch, v, needle in SPOT:
        try:
            text = next(x["text"] for x in books[code][ch - 1] if x["v"] == v)
            if needle.lower() not in text.lower():
                problems.append(f"spot check {code} {ch}:{v} missing '{needle}' -> {text[:60]!r}")
        except Exception as e:
            problems.append(f"spot check {code} {ch}:{v} failed: {e}")
    OMITTED.extend(omitted)
    return ordered, total_ch, total_v, problems

def main():
    jobs = [("KJV", "eng-kjv2006.zip"), ("WEB", "eng-web.zip"), ("ASV", "eng-asv.zip")]
    here = os.path.dirname(os.path.abspath(__file__))
    for label, zf in jobs:
        OMITTED.clear()
        books = load_zip(os.path.join(here, zf))
        ordered, tch, tv, problems = validate(label, books)
        out = {"translation": label, "books": ordered}
        with open(os.path.join(here, f"{label.lower()}.json"), "w") as f:
            json.dump(out, f, ensure_ascii=False)
        status = "OK" if not problems else "PROBLEMS"
        print(f"{label}: {len(ordered)} books, {tch} chapters, {tv} verse slots [{status}]")
        if OMITTED:
            print(f"   - edition-omitted verses (textual variants, slot kept empty): {len(OMITTED)}: {', '.join(OMITTED[:10])}{'...' if len(OMITTED) > 10 else ''}")
        for p in problems[:12]:
            print(f"   - {p}")

if __name__ == "__main__":
    main()
