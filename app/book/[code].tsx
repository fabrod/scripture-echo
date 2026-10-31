import { router, useLocalSearchParams, useNavigation } from 'expo-router';
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
import { getBook, type BookRow } from '@/lib/db';
import { useStore } from '@/lib/store';

export default function BookScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const translation = useStore((s) => s.translation);
  const loadTrack = useStore((s) => s.loadTrack);
  const [book, setBook] = useState<BookRow | null>(null);

  useEffect(() => {
    void getBook(db, translation, code).then((b) => {
      setBook(b);
      if (b) navigation.setOptions({ title: b.name });
    });
  }, [db, translation, code, navigation]);

  if (!book) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Palette.gold} />
      </View>
    );
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{book.name}</Text>
      <Text style={styles.meta}>
        {book.chapters} chapters · {translation}
      </Text>
      <Pressable
        style={styles.listenBtn}
        onPress={() => {
          loadTrack({
            translation,
            bookCode: book.code,
            bookName: book.name,
            chapter: 1,
            totalChapters: book.chapters,
          });
          router.push('/listen');
        }}>
        <Text style={styles.listenText}>▶ Listen from chapter 1</Text>
      </Pressable>
      <View style={styles.grid}>
        {chapters.map((c) => (
          <Pressable
            key={c}
            style={styles.cell}
            onPress={() =>
              router.push({
                pathname: '/read/[book]/[chapter]',
                params: { book: book.code, chapter: String(c) },
              })
            }>
            <Text style={styles.cellText}>{c}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 20, paddingBottom: 40 },
  center: {
    flex: 1,
    backgroundColor: Palette.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Palette.parchment,
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  meta: { color: Palette.muted, fontSize: 14, marginTop: 6 },
  listenBtn: {
    backgroundColor: Palette.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  listenText: { color: Palette.navy900, fontWeight: '700', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  cell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Palette.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { color: Palette.parchment, fontSize: 17, fontWeight: '600' },
});
