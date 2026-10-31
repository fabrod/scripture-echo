import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/Colors';
import { TRANSLATIONS } from '@/lib/config';
import { useStore } from '@/lib/store';

const NAMES = [
  ['100% HUMAN', 'Every chapter read by a real person. No AI voices, ever.'],
  ['ONE VOICE', 'The ASV is read by one man, Genesis to Revelation.'],
  ['FREE FOREVER', 'No ads. No subscriptions. No in-app purchases.'],
  ['PRIVATE BY DESIGN', 'No accounts, no tracking. Everything stays on your phone.'],
  ['THE OFFLINE BIBLE', 'The full text of three translations, built in.'],
  ['OWNED, NOT LICENSED', 'Public-domain Word and recordings — it cannot be taken away.'],
  ['JUST THE WORD', 'No feeds, no social, no noise.'],
];

const FONT_SIZES = [
  { label: 'A', scale: 0.9 },
  { label: 'A+', scale: 1 },
  { label: 'A++', scale: 1.15 },
];

export default function SettingsScreen() {
  const translation = useStore((s) => s.translation);
  const setTranslation = useStore((s) => s.setTranslation);
  const fontScale = useStore((s) => s.fontScale);
  const setFontScale = useStore((s) => s.setFontScale);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.section}>DEFAULT TRANSLATION</Text>
      {TRANSLATIONS.map((t) => (
        <Pressable
          key={t.code}
          style={styles.row}
          onPress={() => void setTranslation(t.code)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>
              {t.name} ({t.short})
            </Text>
            <Text style={styles.rowSub}>Narrated by {t.narrator}</Text>
          </View>
          <Text style={styles.check}>{translation === t.code ? '✓' : ''}</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>READING TEXT SIZE</Text>
      <View style={styles.chips}>
        {FONT_SIZES.map((f) => (
          <Pressable
            key={f.label}
            style={[styles.chip, fontScale === f.scale && styles.chipActive]}
            onPress={() => void setFontScale(f.scale)}>
            <Text
              style={[
                styles.chipText,
                fontScale === f.scale && styles.chipTextActive,
              ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>WHY SCRIPTURE ECHO IS DIFFERENT</Text>
      <View style={styles.card}>
        {NAMES.map(([name, desc]) => (
          <View key={name} style={styles.nameRow}>
            <Text style={styles.nameTitle}>{name}</Text>
            <Text style={styles.nameDesc}>{desc}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>CONTENT & SOURCES</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Scripture texts are public domain: King James Version, World
          English Bible, and American Standard Version (1901), validated
          verse-by-verse against their source editions. Audio narration is
          public-domain LibriVox human recordings — principally Ron Altman
          (complete ASV). Full credits and sources are in the project’s
          CONTENT_LICENSES document.
        </Text>
      </View>

      <Text style={styles.section}>LEGAL</Text>
      <Pressable
        style={styles.row}
        onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })}>
        <Text style={styles.rowTitle}>Privacy Policy</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <Pressable
        style={styles.row}
        onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })}>
        <Text style={styles.rowTitle}>Terms of Use</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Text style={styles.footer}>
        Scripture Echo v1.0.0{'\n'}© 2026 Real Scripture Path Inc.
        {'\n'}realscripturepath.com · Support: fabrod035@gmail.com
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 20, paddingBottom: 44 },
  section: {
    color: Palette.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 26,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.navy700,
  },
  rowTitle: { color: Palette.parchment, fontSize: 16 },
  rowSub: { color: Palette.muted, fontSize: 13, marginTop: 3 },
  check: { color: Palette.gold, fontSize: 18, fontWeight: '700' },
  arrow: { color: Palette.gold, fontSize: 20, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Palette.navy700,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: Palette.gold, borderColor: Palette.gold },
  chipText: { color: Palette.muted, fontWeight: '700', fontSize: 14 },
  chipTextActive: { color: Palette.navy900 },
  card: { backgroundColor: Palette.navy800, borderRadius: 14, padding: 16 },
  nameRow: { paddingVertical: 7 },
  nameTitle: { color: Palette.goldLight, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  nameDesc: { color: Palette.parchment, fontSize: 14, lineHeight: 19, marginTop: 2 },
  body: { color: Palette.parchment, fontSize: 14, lineHeight: 21 },
  footer: {
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 36,
  },
});
