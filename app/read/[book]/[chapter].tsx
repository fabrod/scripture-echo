import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/Colors';
import { getBook, getChapter, type BookRow, type VerseRow } from '@/lib/db';
import { useStore } from '@/lib/store';
import {
  isBookmarked,
  isFavorite,
  toggleBookmark,
  toggleFavorite,
} from '@/lib/userdb';

export default function ReaderScreen() {
  const { book: bookCode, chapter: chapterParam } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();
  const chapter = Number(chapterParam) || 1;
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const translation = useStore((s) => s.translation);
  const fontScale = useStore((s) => s.fontScale);
  const loadTrack = useStore((s) => s.loadTrack);
  const playingTrack = useStore((s) => s.track);

  const [book, setBook] = useState<BookRow | null>(null);
  const [verses, setVerses] = useState<VerseRow[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [selBookmarked, setSelBookmarked] = useState(false);
  const [selFavorite, setSelFavorite] = useState(false);

  useEffect(() => {
    void (async () => {
      const b = await getBook(db, translation, bookCode);
      setBook(b);
      setVerses(await getChapter(db, translation, bookCode, chapter));
      navigation.setOptions({
        title: b ? `${b.name} ${chapter}` : '',
      });
    })();
  }, [db, translation, bookCode, chapter, navigation]);

  const onSelectVerse = useCallback(
    async (verse: number) => {
      if (selected === verse) {
        setSelected(null);
        return;
      }
      setSelected(verse);
      setSelBookmarked(await isBookmarked(translation, bookCode, chapter, verse));
      setSelFavorite(await isFavorite(translation, bookCode, chapter, verse));
    },
    [selected, translation, bookCode, chapter],
  );

  if (!book || verses === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Palette.gold} />
      </View>
    );
  }

  const fontSize = 18 * fontScale;
  const lineHeight = 28 * fontScale;
  const ref = {
    translation,
    book_code: bookCode,
    book_name: book.name,
    chapter,
    verse: selected ?? 0,
  };
  const isCurrentChapter =
    playingTrack?.bookCode === bookCode &&
    playingTrack?.chapter === chapter &&
    playingTrack?.translation === translation;

  const goChapter = (c: number) =>
    router.replace({
      pathname: '/read/[book]/[chapter]',
      params: { book: bookCode, chapter: String(c) },
    });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>
          {book.name} {chapter}
        </Text>
        <Text style={styles.sub}>{translation} · tap a verse to save it</Text>
        <View style={styles.textBlock}>
          {verses.map((v) => (
            <Text
              key={v.verse}
              style={[
                styles.verse,
                { fontSize, lineHeight },
                selected === v.verse && styles.verseSelected,
              ]}
              onPress={() => void onSelectVerse(v.verse)}>
              <Text style={styles.verseNum}>{v.verse} </Text>
              {v.text}{' '}
            </Text>
          ))}
        </View>

        {selected !== null && (
          <View style={styles.actionBar}>
            <Text style={styles.actionRef}>
              {book.name} {chapter}:{selected}
            </Text>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                void toggleBookmark(ref).then(setSelBookmarked)
              }>
              <Text style={styles.actionText}>
                {selBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => void toggleFavorite(ref).then(setSelFavorite)}>
              <Text style={styles.actionText}>
                {selFavorite ? '♥ Favorited' : '♡ Favorite'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.chapterNav}>
          <Pressable
            style={[styles.navBtn, chapter <= 1 && styles.navDisabled]}
            disabled={chapter <= 1}
            onPress={() => goChapter(chapter - 1)}>
            <Text style={styles.navText}>‹ Prev</Text>
          </Pressable>
          <Pressable
            style={[
              styles.navBtn,
              chapter >= book.chapters && styles.navDisabled,
            ]}
            disabled={chapter >= book.chapters}
            onPress={() => goChapter(chapter + 1)}>
            <Text style={styles.navText}>Next ›</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Pressable
        style={styles.listenFab}
        onPress={() => {
          if (!isCurrentChapter) {
            loadTrack({
              translation,
              bookCode,
              bookName: book.name,
              chapter,
              totalChapters: book.chapters,
            });
          }
          router.push('/listen');
        }}>
        <Text style={styles.listenFabText}>
          {isCurrentChapter ? 'Now playing — open player' : '▶ Listen to this chapter'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  center: {
    flex: 1,
    backgroundColor: Palette.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, paddingBottom: 110 },
  heading: {
    color: Palette.parchment,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  sub: { color: Palette.muted, fontSize: 13, marginTop: 4 },
  textBlock: { marginTop: 18 },
  verse: { color: Palette.parchment, fontFamily: 'Georgia' },
  verseNum: { color: Palette.gold, fontSize: 12, fontWeight: '700' },
  verseSelected: { backgroundColor: Palette.navy700 },
  actionBar: {
    backgroundColor: Palette.navy800,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    gap: 8,
  },
  actionRef: { color: Palette.gold, fontWeight: '700', fontSize: 14 },
  actionBtn: {
    borderWidth: 1,
    borderColor: Palette.navy700,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionText: { color: Palette.parchment, fontSize: 15, fontWeight: '600' },
  chapterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  navBtn: {
    borderWidth: 1,
    borderColor: Palette.gold,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  navDisabled: { opacity: 0.3 },
  navText: { color: Palette.gold, fontWeight: '700', fontSize: 15 },
  listenFab: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 18,
    backgroundColor: Palette.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  listenFabText: { color: Palette.navy900, fontWeight: '800', fontSize: 16 },
});
