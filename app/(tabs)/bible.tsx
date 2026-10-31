import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Palette } from '@/constants/Colors';
import { TRANSLATIONS, type TranslationCode } from '@/lib/config';
import { getBooks, searchVerses, type BookRow, type SearchHit } from '@/lib/db';
import { useStore } from '@/lib/store';

export default function BibleScreen() {
  const db = useSQLiteContext();
  const translation = useStore((s) => s.translation);
  const setTranslation = useStore((s) => s.setTranslation);
  const [bookData, setBookData] = useState<{
    t: TranslationCode;
    books: BookRow[];
  } | null>(null);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const books =
    bookData && bookData.t === translation ? bookData.books : null;

  useEffect(() => {
    void getBooks(db, translation).then((b) =>
      setBookData({ t: translation, books: b }),
    );
  }, [db, translation]);

  useEffect(() => {
    let live = true;
    void searchVerses(db, translation, query).then((r) => {
      if (live) setHits(r);
    });
    return () => {
      live = false;
    };
  }, [db, translation, query]);

  const sections = useMemo(() => {
    if (!books) return [];
    return [
      { title: 'Old Testament', data: books.filter((b) => b.position < 39) },
      { title: 'New Testament', data: books.filter((b) => b.position >= 39) },
    ];
  }, [books]);

  const searching = query.trim().length >= 3;

  return (
    <View style={styles.screen}>
      <View style={styles.chips}>
        {TRANSLATIONS.map((t) => (
          <Pressable
            key={t.code}
            style={[styles.chip, translation === t.code && styles.chipActive]}
            onPress={() => void setTranslation(t.code as TranslationCode)}>
            <Text
              style={[
                styles.chipText,
                translation === t.code && styles.chipTextActive,
              ]}>
              {t.short}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        testID="scripture-search"
        style={styles.search}
        placeholder="Search the Scriptures…"
        placeholderTextColor={Palette.muted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      {searching ? (
        <FlatList
          data={hits}
          keyExtractor={(h, i) => `${h.book_code}-${h.chapter}-${h.verse}-${i}`}
          ListEmptyComponent={
            <Text style={styles.empty}>No verses found for “{query.trim()}”.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.hit}
              onPress={() =>
                router.push({
                  pathname: '/read/[book]/[chapter]',
                  params: { book: item.book_code, chapter: String(item.chapter) },
                })
              }>
              <Text style={styles.hitRef}>
                {item.book_name} {item.chapter}:{item.verse}
              </Text>
              <Text style={styles.hitText} numberOfLines={3}>
                {item.text}
              </Text>
            </Pressable>
          )}
        />
      ) : books === null ? (
        <ActivityIndicator color={Palette.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.title}
          renderItem={({ item: section }) => (
            <View>
              <Text style={styles.section}>{section.title}</Text>
              {section.data.map((b) => (
                <Pressable
                  key={b.code}
                  testID={`book-${b.code}`}
                  style={styles.bookRow}
                  onPress={() =>
                    router.push({
                      pathname: '/book/[code]',
                      params: { code: b.code },
                    })
                  }>
                  <Text style={styles.bookName}>{b.name}</Text>
                  <Text style={styles.bookMeta}>
                    {b.chapters} ch ›
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900, paddingHorizontal: 16 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: {
    borderWidth: 1,
    borderColor: Palette.navy700,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: Palette.gold, borderColor: Palette.gold },
  chipText: { color: Palette.muted, fontWeight: '700', fontSize: 14 },
  chipTextActive: { color: Palette.navy900 },
  search: {
    backgroundColor: Palette.navy800,
    color: Palette.parchment,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    color: Palette.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 22,
    marginBottom: 6,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.navy700,
  },
  bookName: { color: Palette.parchment, fontSize: 17 },
  bookMeta: { color: Palette.muted, fontSize: 13 },
  hit: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.navy700,
  },
  hitRef: { color: Palette.gold, fontSize: 13, fontWeight: '700' },
  hitText: { color: Palette.parchment, fontSize: 15, lineHeight: 21, marginTop: 4 },
  empty: { color: Palette.muted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
