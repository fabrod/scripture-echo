import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/Colors';
import { formatTime } from '@/lib/format';
import { useStore } from '@/lib/store';
import {
  listBookmarks,
  listFavorites,
  listHistory,
  type HistoryEntry,
  type SavedRef,
} from '@/lib/userdb';

function RefRow({ r }: { r: SavedRef }) {
  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/read/[book]/[chapter]',
          params: { book: r.book_code, chapter: String(r.chapter) },
        })
      }>
      <Text style={styles.rowTitle}>
        {r.book_name} {r.chapter}:{r.verse}
      </Text>
      <Text style={styles.rowMeta}>{r.translation} ›</Text>
    </Pressable>
  );
}

export default function SavedScreen() {
  const loadTrack = useStore((s) => s.loadTrack);
  const [bookmarks, setBookmarks] = useState<SavedRef[] | null>(null);
  const [favorites, setFavorites] = useState<SavedRef[] | null>(null);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setBookmarks(await listBookmarks());
        setFavorites(await listFavorites());
        setHistory(await listHistory(20));
      })();
    }, []),
  );

  const loading = bookmarks === null || favorites === null || history === null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {loading ? (
        <ActivityIndicator color={Palette.gold} style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={styles.section}>Bookmarks</Text>
          {bookmarks.length === 0 ? (
            <Text style={styles.empty}>
              Tap any verse while reading to bookmark it.
            </Text>
          ) : (
            bookmarks.map((r) => <RefRow key={`b${r.id}`} r={r} />)
          )}

          <Text style={styles.section}>Favorites</Text>
          {favorites.length === 0 ? (
            <Text style={styles.empty}>
              Verses you favorite while reading will live here.
            </Text>
          ) : (
            favorites.map((r) => <RefRow key={`f${r.id}`} r={r} />)
          )}

          <Text style={styles.section}>Recently heard</Text>
          {history.length === 0 ? (
            <Text style={styles.empty}>Your listening history will appear here.</Text>
          ) : (
            history.map((h) => (
              <Pressable
                key={`h${h.id}`}
                style={styles.row}
                onPress={() => {
                  loadTrack(
                    {
                      translation: h.translation,
                      bookCode: h.book_code,
                      bookName: h.book_name,
                      chapter: h.chapter,
                      totalChapters: 999,
                    },
                    { resumeSec: h.position_sec },
                  );
                  router.push('/listen');
                }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {h.book_name} {h.chapter} · {h.translation}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {formatTime(h.position_sec)}
                    {h.duration_sec > 0 ? ` of ${formatTime(h.duration_sec)}` : ''}
                  </Text>
                </View>
                <Text style={styles.rowMeta}>Resume ›</Text>
              </Pressable>
            ))
          )}
          <Text style={styles.note}>
            All of this lives only on your phone. Nothing is uploaded, ever.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    color: Palette.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.navy700,
  },
  rowTitle: { color: Palette.parchment, fontSize: 16 },
  rowMeta: { color: Palette.muted, fontSize: 13 },
  empty: { color: Palette.muted, fontSize: 14, paddingVertical: 8 },
  note: { color: Palette.muted, fontSize: 12, marginTop: 28, fontStyle: 'italic' },
});
