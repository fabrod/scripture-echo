# Scripture Echo

**The Bible, Beautifully Spoken.**

A completely free iPhone app for listening to and reading God's Word —
100% human narration (no AI voices), no ads, no subscriptions, no accounts,
no tracking. By Real Scripture Path Inc. · realscripturepath.com
© 2026 Real Scripture Path Inc.

**Translations (all public domain, bundled locally — reading works fully offline):**
King James Version (primary) · World English Bible · American Standard Version

**Audio:** pre-rendered chapter narration hosted on our own infrastructure,
with offline downloads, background playback, lock-screen controls, playback
speeds (0.75x–2x), sleep timer, and resume. See `CONTENT_LICENSES.md` for the
narration licensing rules and `docs/AUDIO_DECISION.md` for the voice decision.

## Stack

- Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router
- expo-audio (playback) · expo-sqlite (bundled Scripture DB) · Zustand (player state)
- EAS Build / TestFlight / App Store Connect

## Setup

```bash
npm install
npx expo start          # dev server (development build required for native modules)
npx tsc --noEmit        # typecheck
npx expo lint           # lint
npx expo-doctor         # project health
```

## Scripture data pipeline

Source texts are authoritative USFM downloads from eBible.org (see
`CONTENT_LICENSES.md` for editions and rights). The pipeline lives in
`tools/` and the working data directory:

```bash
python3 tools/parse_usfm.py   # USFM -> validated JSON (66 books / 1,189 chapters checks)
python3 tools/make_sqlite.py  # JSON -> scripture.db (bundled app asset)
```

Validation results (2026-10-31): KJV 31,102 verses exact; WEB 31,103 slots
(5 documented edition omissions); ASV 31,102 slots (16 documented omissions).

## Builds (run on the developer Mac)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

Bundle ID: `com.fabrod.scripturepathaudio` · Name: Scripture Path Audio Bible
