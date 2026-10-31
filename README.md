# Scripture Echo

**The Bible, Beautifully Spoken.**

A completely free iPhone app for listening to and reading God's Word —
100% human narration (no AI voices), no ads, no subscriptions, no accounts,
no tracking.

**Scripture text:** King James Version (primary), World English Bible, and
American Standard Version are public domain and bundled in the app's SQLite
asset. Reading, searching, bookmarks, and navigation work with zero internet.
There is no production text API or remote database.

**Human audio:** Narration comes from public-domain LibriVox recordings by
volunteer readers. Production chapter MP3s are stored as ordinary objects in a
Cloudflare R2 bucket and delivered through
`https://audio.scriptureecho.app`. R2 is file storage, not a separate
streaming platform. The app requests files using this layout:

```text
https://audio.scriptureecho.app/{translation}/{BOOK}/{chapter}.mp3

asv/GEN/001.mp3
kjv/GEN/001.mp3
web/GEN/001.mp3
```

Translation directories are lowercase, OSIS book codes are uppercase, and
chapter numbers are three digits. The repository currently contains three ASV
Genesis files used as development/test fixtures; the complete production
library belongs in R2 and can be updated without releasing a new app build.
See `CONTENT_LICENSES.md` and `docs/AUDIO_DECISION.md` for sources, narrator
credits, and licensing.

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

The production build uses `https://audio.scriptureecho.app` whenever the
override is absent. This separate domain is planned but is not registered or
active yet. Before App Store submission, the R2 custom domain must be active
over HTTPS and representative chapters from ASV, KJV, and WEB must be played
successfully in a TestFlight build on a physical iPhone.

## Production audio hosting

The production audio dependency is deliberately simple:

1. A Cloudflare R2 bucket contains the chapter MP3 objects.
2. The bucket's custom domain is `audio.scriptureecho.app`.
3. The app downloads or plays the requested chapter directly from that domain.
4. Scripture text remains local even if the device is offline or R2 is
   temporarily unavailable.

No application server, audio database, account system, or paid narration API
is required. A production audio deployment is ready only when:

- every advertised chapter exists at the expected path;
- objects return HTTPS success responses with an audio MIME type;
- seeking/playback works through the custom domain;
- missing chapters produce the app's unavailable state instead of a crash;
- all three translations pass the TestFlight playback smoke test.

The Cloudflare setup status and exact next steps are recorded in
[`docs/CLOUDFLARE_HANDOFF.md`](docs/CLOUDFLARE_HANDOFF.md). Scripture Echo is
independent from `realscripturepath.com`; do not use, connect, or modify that
domain for this project.

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
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios
```

Bundle ID: `com.fabrod.scriptureecho` · Name: Scripture Echo
