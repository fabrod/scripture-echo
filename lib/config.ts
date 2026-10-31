/**
 * Scripture Echo — central configuration.
 *
 * AUDIO_BASE_URL points at the chapter-audio host. Chapter files live at
 *   {AUDIO_BASE_URL}/{translation}/{BOOK}/{NNN}.mp3   e.g. .../asv/GEN/001.mp3
 * Until the library is uploaded, chapters without a bundled copy show an
 * honest "being prepared" state in the player — text always works offline.
 */
export const AUDIO_BASE_URL =
  process.env.EXPO_PUBLIC_AUDIO_BASE_URL ?? 'https://audio.realscripturepath.com';

export type TranslationCode = 'KJV' | 'WEB' | 'ASV';

export interface TranslationInfo {
  code: TranslationCode;
  name: string;
  short: string;
  narrator: string;
  narratorNote: string;
}

export const TRANSLATIONS: TranslationInfo[] = [
  {
    code: 'KJV',
    name: 'King James Version',
    short: 'KJV',
    narrator: 'LibriVox readers',
    narratorNote: 'Human readers via LibriVox (solo readers preferred, curated per book).',
  },
  {
    code: 'WEB',
    name: 'World English Bible',
    short: 'WEB',
    narrator: 'LibriVox readers',
    narratorNote: 'Human readers via LibriVox.',
  },
  {
    code: 'ASV',
    name: 'American Standard Version',
    short: 'ASV',
    narrator: 'Ron Altman',
    narratorNote: 'The complete Bible read by one man — Ron Altman, via LibriVox.',
  },
];

export function translationInfo(code: TranslationCode): TranslationInfo {
  return TRANSLATIONS.find((t) => t.code === code) ?? TRANSLATIONS[0];
}

/** Pad a chapter number to the 3-digit file form used by the audio library. */
export function chapterFile(chapter: number): string {
  return String(chapter).padStart(3, '0');
}

export function remoteChapterUrl(
  translation: TranslationCode,
  bookCode: string,
  chapter: number,
): string {
  return `${AUDIO_BASE_URL}/${translation.toLowerCase()}/${bookCode}/${chapterFile(chapter)}.mp3`;
}
