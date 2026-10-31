/**
 * Scripture Path Audio Bible — visual identity.
 * Midnight navy + warm gold. Dark-first: the app ships as a calm,
 * premium listening experience (see app.json userInterfaceStyle: "dark").
 * The light palette mirrors the same identity for system-light devices.
 */
export const Palette = {
  // Sampled from the Scripture Echo brand card (user-supplied, 2026-10-31)
  navy950: '#0A1226', // deepest background gradient stop
  navy900: '#131B2E', // primary background (brand card navy; splash, adaptive icon)
  navy800: '#24324C', // tile / card background (brand tile navy)
  navy700: '#2E405F', // raised surfaces / borders
  gold: '#DCCB9E', // primary accent (brand champagne gold)
  goldLight: '#EAD9AC', // highlights, active states
  parchment: '#F5EFE0', // primary text (warm white)
  muted: '#8FA3BF', // secondary text
  error: '#D96C5F',
};

const tintColorLight = Palette.gold;
const tintColorDark = Palette.gold;

export default {
  light: {
    text: '#12233A',
    background: '#F7F3E9',
    tint: tintColorLight,
    tabIconDefault: '#9AA7B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Palette.parchment,
    background: Palette.navy900,
    tint: tintColorDark,
    tabIconDefault: Palette.muted,
    tabIconSelected: tintColorDark,
  },
};
