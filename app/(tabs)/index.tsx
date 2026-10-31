import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/Colors';
import { translationInfo } from '@/lib/config';
import { getVerse } from '@/lib/db';
import { useStore } from '@/lib/store';
import { listHistory, type HistoryEntry } from '@/lib/userdb';
import { verseOfTheDay } from '@/lib/votd';

const QUICK_LISTEN = [
  { book: 'GEN', bookName: 'Genesis', chapter: 1, chapters: 50, label: 'Genesis 1 — The Beginning' },
  { book: 'PSA', bookName: 'Psalms', chapter: 23, chapters: 150, label: 'Psalm 23 — The Lord Is My Shepherd' },
  { book: 'JHN', bookName: 'John', chapter: 1, chapters: 21, label: 'John 1 — The Word Became Flesh' },
];

export default function HomeScreen() {
  const db = useSQLiteContext();
  const translation = useStore((s) => s.translation);
  const loadTrack = useStore((s) => s.loadTrack);
  const [votdText, setVotdText] = useState<string | null>(null);
  const [last, setLast] = useState<HistoryEntry | null>(null);
  const votd = verseOfTheDay();

  useEffect(() => {
    void (async () => {
      const v = await getVerse(db, translation, votd.book, votd.chapter, votd.verse);
      setVotdText(v?.text ?? null);
      const h = await listHistory(1);
      setLast(h[0] ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, translation]);

  const play = (
    book: string,
    bookName: string,
    chapter: number,
    chapters: number,
    resumeSec = 0,
  ) => {
    loadTrack(
      { translation, bookCode: book, bookName, chapter, totalChapters: chapters },
      { resumeSec },
    );
    router.push('/listen');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>SCRIPTURE ECHO</Text>
      <Text style={styles.tagline}>The Bible, Beautifully Spoken.</Text>
      <Text style={styles.human}>100% HUMAN NARRATION — NO AI VOICES</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>VERSE OF THE DAY</Text>
        {votdText === null ? (
          <ActivityIndicator color={Palette.gold} />
        ) : (
          <>
            <Text style={styles.verseText}>{votdText}</Text>
            <Text style={styles.verseRef}>
              {votd.bookName} {votd.chapter}:{votd.verse} · {translation}
            </Text>
            <View style={styles.row}>
              <Pressable
                style={styles.goldBtn}
                onPress={() =>
                  router.push({
                    pathname: '/read/[book]/[chapter]',
                    params: { book: votd.book, chapter: String(votd.chapter) },
                  })
                }>
                <Text style={styles.goldBtnText}>Read</Text>
              </Pressable>
              <Pressable
                style={styles.ghostBtn}
                onPress={() =>
                  play(votd.book, votd.bookName, votd.chapter, 999)
                }>
                <Text style={styles.ghostBtnText}>Listen</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>

      {last && (
        <Pressable
          style={styles.card}
          onPress={() =>
            play(
              last.book_code,
              last.book_name,
              last.chapter,
              999,
              last.position_sec,
            )
          }>
          <Text style={styles.cardLabel}>CONTINUE LISTENING</Text>
          <Text style={styles.continueTitle}>
            {last.book_name} {last.chapter} · {last.translation}
          </Text>
          <Text style={styles.continueSub}>
            Narrated by {translationInfo(last.translation).narrator} — tap to resume
          </Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>Start listening</Text>
      {QUICK_LISTEN.map((q) => (
        <Pressable
          key={q.label}
          style={styles.quickRow}
          onPress={() => play(q.book, q.bookName, q.chapter, q.chapters)}>
          <Text style={styles.quickLabel}>{q.label}</Text>
          <Text style={styles.quickArrow}>›</Text>
        </Pressable>
      ))}

      <View style={styles.mission}>
        <Text style={styles.missionText}>
          Completely free. No ads, no accounts, no tracking — just the Word of
          God, read by real human voices. A ministry of Real Scripture Path Inc.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 20, paddingBottom: 40 },
  brand: {
    color: Palette.gold,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  tagline: { color: Palette.parchment, fontSize: 17, marginTop: 4, fontStyle: 'italic' },
  human: {
    color: Palette.goldLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 10,
  },
  card: {
    backgroundColor: Palette.navy800,
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
  },
  cardLabel: {
    color: Palette.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  verseText: {
    color: Palette.parchment,
    fontSize: 19,
    lineHeight: 28,
    fontFamily: 'Georgia',
  },
  verseRef: { color: Palette.muted, fontSize: 13, marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 14 },
  goldBtn: {
    backgroundColor: Palette.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goldBtnText: { color: Palette.navy900, fontWeight: '700', fontSize: 15 },
  ghostBtn: {
    borderColor: Palette.gold,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ghostBtnText: { color: Palette.gold, fontWeight: '600', fontSize: 15 },
  continueTitle: { color: Palette.parchment, fontSize: 18, fontWeight: '600' },
  continueSub: { color: Palette.muted, fontSize: 13, marginTop: 6 },
  sectionTitle: {
    color: Palette.parchment,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.navy800,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  quickLabel: { color: Palette.parchment, fontSize: 15, flex: 1 },
  quickArrow: { color: Palette.gold, fontSize: 22, fontWeight: '700' },
  mission: { marginTop: 30, paddingHorizontal: 4 },
  missionText: { color: Palette.muted, fontSize: 13, lineHeight: 19 },
});
