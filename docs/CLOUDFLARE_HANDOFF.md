# Cloudflare handoff — Scripture Echo

Last updated: October 31, 2026

## Hard boundary

Scripture Echo is independent from `realscripturepath.com`. Do not access,
modify, connect, or use that domain or its IONOS account for this project.
The mistakenly created inactive Cloudflare zone was removed. Its live DNS,
nameservers, website, email, and IONOS configuration were never changed.

## Completed

- Cloudflare R2 is activated on the current Cloudflare account.
- The Standard-storage R2 bucket `scripture-echo-audio` exists in Eastern
  North America.
- The bucket is empty and has no custom domain yet.
- R2 showed $0 billable usage when setup paused.
- The app's default audio URL is `https://audio.scriptureecho.app`.

## Paused before purchase

`scriptureecho.app` was available in Cloudflare Registrar on October 31, 2026
for $8.20 at registration and $14.20/year at renewal. Availability and pricing
can change. The domain was not purchased. Obtain the user's explicit approval
for the current checkout price immediately before purchase.

## Resume checklist

1. Recheck `scriptureecho.app` availability and current registration/renewal
   price in Cloudflare Registrar.
2. With explicit purchase approval, register `scriptureecho.app` in the same
   Cloudflare account as R2.
3. Open R2 bucket `scripture-echo-audio` → Settings → Custom Domains and attach
   `audio.scriptureecho.app` with HTTPS.
4. Keep the bucket on Standard storage so the R2 free tier applies.
5. Configure a cache rule for the audio hostname and add an R2 budget alert.
6. Upload chapter files with this exact object layout:

   ```text
   asv/GEN/001.mp3
   kjv/GEN/001.mp3
   web/GEN/001.mp3
   ```

   Translation directories are lowercase, OSIS book codes are uppercase, and
   chapter numbers are three digits.
7. Verify HTTPS status, `audio/mpeg`, byte-range playback/seeking, and missing
   chapter behavior through the custom domain.
8. Replace remaining `realscripturepath.com` branding/support/legal references
   in App Store metadata and legal files after the correct Scripture Echo owner,
   support email, and public website are confirmed.
9. Run lint, typecheck, Expo Doctor, Maestro native E2E, and physical-iPhone
   TestFlight playback for ASV, KJV, and WEB before App Store submission.

## R2 free-tier reference at pause time

- Standard storage: 10 GB-month/month included
- Class A operations: 1 million/month included
- Class B operations: 10 million/month included
- Internet egress: free

Cloudflare usage pricing can change; verify the dashboard before production
launch.
