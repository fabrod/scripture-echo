# CONTENT LICENSES — Scripture Path Audio Bible

Every text in this app is public domain or dedicated to the public domain.
No licensed translation (NIV, ESV, NKJV, NLT, CSB, NASB, AMP) is included;
none may be added without documented written permission on file here.

## Scripture texts

All source files are authoritative downloads from **eBible.org** (not scraped):

| Translation | Edition / source file | Rights status |
|---|---|---|
| King James Version (KJV) — primary | `eng-kjv2006_usfm.zip`, KJV 2006 edition via eBible.org | Public domain in the United States. **Territorial note:** the KJV text is under perpetual Crown copyright in the United Kingdom (Letters Patent held by the King's Printer / Cambridge University Press). US-based distribution is unencumbered; before any UK-specific marketing push, confirm the Crown licensing position with counsel. eBible.org distributes this edition freely for ministry use. |
| World English Bible (WEB) | `eng-web_usfm.zip` via eBible.org | Dedicated to the public domain by its translators (eBible.org / Michael Paul Johnson and team). No copyright restrictions on the text. "World English Bible" is a trademark of eBible.org — the app refers to it descriptively as a translation name, which the WEB trademark policy permits. |
| American Standard Version (ASV) | `eng-asv_usfm.zip` via eBible.org (ASV 1901) | Public domain in the United States (published 1901; copyright expired). |

## Validation (Stage 1, 2026-10-31)

Parsed with `tools/parse_usfm.py` and verified against the Protestant canon
structure (66 books, 1,189 chapters):

- **KJV:** 66 books, 1,189 chapters, **31,102 verses** — exact canonical count, zero defects.
- **WEB:** 66 books, 1,189 chapters, 31,103 verse slots; **5 verses the edition itself omits** (later-manuscript textual variants; slots kept empty so numbering matches print): Luke 17:36, Acts 8:37, Acts 15:34, Acts 24:7, Romans 16:25 (the doxology stands at the end of Romans 14 in this edition).
- **ASV:** 66 books, 1,189 chapters, 31,102 verse slots; **16 edition-omitted verses** (same class of variants): Matt 17:21, 18:11, 23:14; Mark 7:16, 9:44, 9:46, 11:26, 15:28; Luke 17:36, 23:17; John 5:4; Acts 8:37, 15:34, 24:7; Rom 16:24; 1 John 5:7 (partial — see data).
- Exact-text spot checks passed (Gen 1:1, John 1:1, Ps 23:1, Eph 6:11, Rev 22:21) in all three.
- Psalm superscriptions (e.g. "A Psalm of David.") are retained as part of verse 1,
  matching the KJV print tradition.

Source JSON SHA-256 checksums are stored in `scripture.db` (`meta` table) for audit.

## Audio narration

**Status: SOLVED with 100% human recordings (user decision, 2026-10-31).**
No synthetic/AI narration is used anywhere in this app. All narration is real
human recording, public domain, hosted on infrastructure we control.

| Translation | Recording | Rights |
|---|---|---|
| ASV | LibriVox "Bible (ASV), Complete," narrated by **Ron Altman** (all 66 books, one narrator, 103h55m, 2021) | LibriVox recordings are dedicated to the public domain (USA). Credit: "ASV narration by Ron Altman (LibriVox, public domain)." |
| KJV | LibriVox "Bible (King James Version)" (per-book solo readers) | Public domain (LibriVox). Per-book narrator credits ship in the app's license screen. |
| WEB | LibriVox World English Bible recordings (volunteer readers) | Public domain (LibriVox); the WEB text itself is public domain. |

Rules carried from the brief: never imitate a real narrator's voice; no paid
per-request TTS APIs; files are chapter-split and verified against the
validated text data before release. Full research: `docs/AUDIO_DECISION.md`.
