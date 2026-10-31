# Scripture Echo

**The Bible, Beautifully Spoken.**

A completely free iPhone app for listening to and reading God's Word —
100% human narration (no AI voices), no ads, no subscriptions, no accounts,
no tracking. By Real Scripture Path Inc. · realscripturepath.com
© 2026 Real Scripture Path Inc.

**Translations (all public domain, bundled locally — reading works fully offline):**
King James Version (primary) · World English Bible · American Standard Version

**Audio:** ASV Genesis 1–3 are bundled for offline playback. Other chapters
use pre-rendered files from `https://audio.realscripturepath.com` following the
path `{translation}/{BOOK}/{chapter}.mp3`. The hosted library must be deployed
before those chapters are advertised as available. See `CONTENT_LICENSES.md`
and `docs/AUDIO_DECISION.md` for sources and licensing.

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

## Native iOS end-to-end tests

Cypress cannot drive a native iOS app. The committed Maestro flows exercise
the locally compiled app on an iOS Simulator using the production bundle ID.
They cover the database/navigation/settings smoke path, bundled ASV playback
and reading, and remote-server playback for a non-bundled chapter.

```bash
npx expo run:ios
npm run test:e2e:ios
```

The local machine needs Java 17+ and the Maestro CLI. See Expo's Maestro E2E
guide and the Maestro installation documentation before running the suite on
a new Mac.

For the remote-audio integration flow, serve a fixture using the production
folder layout and start Metro with a local host override:

```bash
mkdir -p /tmp/scripture-echo-audio/asv/GEN
ln -sf "$PWD/assets/audio/asv-gen-001.mp3" /tmp/scripture-echo-audio/asv/GEN/004.mp3
python3 -m http.server 8099 --bind 127.0.0.1 --directory /tmp/scripture-echo-audio
EXPO_PUBLIC_AUDIO_BASE_URL=http://127.0.0.1:8099 npx expo start --clear
```

The production build uses `https://audio.realscripturepath.com` whenever the
override is absent.

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

Bundle ID: `com.fabrod.scriptureecho` · Name: Scripture Echo
