# AUDIO DECISION — 100% HUMAN narration (user decision, 2026-10-31)

**Decision: the app's narration is 100% human. All synthetic voices are closed**
(Piper tested and set aside; Kokoro not pursued; Apple on-device TTS rejected
in the original brief). No AI voice will ever be listed as a narrator.

## Verified human sources (researched 2026-10-31)

### 1. ASV — COMPLETE, ONE NARRATOR, PUBLIC DOMAIN ✅ (flagship)
- **LibriVox "Bible (ASV), Complete"** — read entirely by **Ron Altman**:
  all 129 sections, Genesis → Revelation, one human voice across all 66 books.
- Running time 103:55:02 · cataloged 2021-12-31 · LibriVox recordings are
  public domain in the USA (readers dedicate their recordings to the PD).
- Source of truth: https://librivox.org/holy-bible-complete-american-standard-version/
  Archive item: `bible_asv_complete_2112_librivox` (128 kbps originals + 64 kbps).
- Sample in `audio-samples/genesis1-asv-ronaltman-HUMAN.mp3` (Genesis 1, first 2 min).
- Credit line for the app: "ASV narration by Ron Altman (LibriVox, public domain)."
- Engineering note: files are section-grouped (e.g. "Genesis 1-14"), so the
  Stage 3 pipeline must split sections into per-chapter files (chapter
  announcements + silence detection) and strip the LibriVox spoken disclaimer
  (permitted — the recordings are public domain). Chapter boundaries get
  verified against our validated verse data before anything ships.

### 2. KJV — COMPLETE, 100% HUMAN, PUBLIC DOMAIN (per-book readers)
- LibriVox "Bible (King James Version)" group project covers the whole Bible;
  each book is read by a single reader (e.g. Mark — Sundiata; 1 Kings — Joy Chan),
  so the voice is consistent *within* a book and changes *between* books.
- The famous single-narrator KJV recordings (Scourby, James Earl Jones,
  Eric Martin) are commercial copyrighted works — **not usable**.
- Paths to a single owned KJV voice later: (a) commission a narrator under a
  full work-for-hire buyout; (b) a narrator from our own community recording
  under a signed release; (c) FCBH partnership (below).

### 3. WEB — human recordings exist, weakest consistency
- LibriVox WEB New Testament is a multi-volunteer production (voices vary
  even within books, per listener reviews); a WEB Old Testament exists too.
  Usable, 100% human, public domain — but the least consistent of the three.

### 4. Partnership path — Faith Comes By Hearing "Bible Brain" API
- Free for non-commercial use; professional recordings incl. KJV and WEB,
  served by API (not files on our infrastructure).
- License constraints (their legal page): content must reach end users free;
  **offline storage only where explicitly marked allowed** — our offline
  downloads headline feature is therefore only partially compatible.
- Kept as an option, not the foundation.

## Cost model (owned-files paths 1–3)
- Downloads: ASV ≈ 2.92 GB (64 kbps set) / ~7–8 GB at 128 kbps; KJV/WEB similar scale.
- Hosting: zero-egress object storage (e.g. Cloudflare R2) — a few GB per
  translation, inside or near the free tier; chapters upload + manifest
  updates require no app release.

## What happens next (on the user's path choice)
- **Path A:** all three translations get human audio at launch — ASV flagship
  single voice (Altman) + KJV/WEB LibriVox. Fastest, $0, we own the files.
- **Path B:** ASV (Altman) at launch; KJV audio held until a single narrator
  is secured (commission / community narrator / FCBH), KJV ships text-first.
- **Path C:** Bible Brain API for professional KJV/WEB audio; offline
  downloads limited by FCBH license terms.
