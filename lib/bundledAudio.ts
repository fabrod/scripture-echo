/**
 * Chapters bundled inside the app binary so listening works end-to-end
 * (and fully offline) before the hosted library is switched on.
 * Grows as the split library is packaged per release.
 */
import type { TranslationCode } from './config';

const BUNDLED: Record<string, number> = {
  'ASV:GEN:1': require('../assets/audio/asv-gen-001.mp3'),
  'ASV:GEN:2': require('../assets/audio/asv-gen-002.mp3'),
  'ASV:GEN:3': require('../assets/audio/asv-gen-003.mp3'),
};

export function bundledChapter(
  translation: TranslationCode,
  bookCode: string,
  chapter: number,
): number | null {
  return BUNDLED[`${translation}:${bookCode}:${chapter}`] ?? null;
}
