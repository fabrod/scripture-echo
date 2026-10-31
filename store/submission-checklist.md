# Submission Checklist — Scripture Echo 1.0.0

## Agent-prepared (done)
- [x] App code complete: Home / Bible / Listen / Saved / Settings, reader,
      player, search, bookmarks, favorites, history, legal screens
- [x] Tests: `npm run typecheck` clean · `npm run lint` clean ·
      `npx expo-doctor` 20/20 · app SQL queries verified against bundled DB ·
      `npx expo export --platform ios` bundle builds (26 MB, DB + audio in)
- [x] Icon 1024px, splash, adaptive icon (brand navy/gold)
- [x] Screenshots 1179×2556 ×3 in store/screenshots/
- [x] PRIVACY_POLICY.md + TERMS_OF_USE.md + HTML in docs/legal/
- [x] Listing copy in store/app-store-listing.md; privacy answers in
      store/app-privacy-answers.md
- [x] eas.json submit config: appleId fabioanel@me.com
- [x] Encryption: ITSAppUsesNonExemptEncryption = false

## User steps (Mac + App Store Connect)
1. `git clone` the repo (or pull), `npm install`, `npm install -g eas-cli`, `eas login`
2. `eas build --platform ios --profile production`
   (prompts: create EAS project y · encryption exempt y · Apple login y ·
   generate distribution certificate y · provisioning profile y)
3. Deploy the Privacy Policy HTML and note its URL (Render service) —
   listing needs the live URL before submission.
4. `eas submit --platform ios` → select the finished build → generate ASC
   API key (ADMIN) → uploaded to App Store Connect.
5. In App Store Connect (https://appstoreconnect.apple.com): create/claim
   the app record — **name "Scripture Echo — Audio Bible"** (claims the
   name), bundle `com.fabrod.scriptureecho` → paste listing copy, upload
   screenshots from store/screenshots/, paste privacy answers
   (Data Not Collected), set Privacy Policy URL, price Free, category Books.
6. TestFlight: install on your iPhone, cold-launch, listen to Genesis 1
   (ASV) end-to-end, check lock-screen controls — YOUR eyes/ears gate.
7. Submit for review (expect 1–3 days).

## Known rollout state (honest)
- Bundled offline audio in 1.0.0: ASV Genesis 1–3. All other chapters
  stream from the hosted library once AUDIO_BASE_URL is live (audio host
  upload is the remaining ops step; chapter files are split and manifest-
  tracked in the data workspace). The full ASV (1,189 chapters) batch is
  splitting from the LibriVox download; KJV assembly follows its curation
  table; WEB after KJV.
- KJV Song of Solomon: no straight human KJV reading exists on LibriVox
  (ASV/WEB carry its audio). Recommendation is text-only at launch; the
  choice was presented to the user 2026-10-31 and awaits his ruling —
  text-only is the working default until he decides.
