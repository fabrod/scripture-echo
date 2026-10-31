import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette } from '@/constants/Colors';
import { translationInfo } from '@/lib/config';
import { formatTime } from '@/lib/format';
import { useStore } from '@/lib/store';

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEPS: { label: string; minutes: number | null; chapterEnd?: boolean }[] = [
  { label: 'Off', minutes: null },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
  { label: 'End of chapter', minutes: null, chapterEnd: true },
];

function CtrlBtn({
  icon,
  label,
  onPress,
  big,
}: {
  icon: string;
  label?: string;
  onPress: () => void;
  big?: boolean;
}) {
  const size = big ? 76 : 52;
  return (
    <Pressable
      testID={big ? 'player-toggle' : undefined}
      style={[
        styles.ctrl,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: big ? Palette.gold : Palette.navy800,
        },
      ]}
      onPress={onPress}>
      <SymbolView
        name={icon as never}
        size={big ? 34 : 22}
        tintColor={big ? Palette.navy900 : Palette.parchment}
        fallback={
          <Text style={{ color: big ? Palette.navy900 : Palette.parchment, fontWeight: '700' }}>
            {label ?? ''}
          </Text>
        }
      />
    </Pressable>
  );
}

export default function ListenScreen() {
  const track = useStore((s) => s.track);
  const status = useStore((s) => s.status);
  const position = useStore((s) => s.position);
  const duration = useStore((s) => s.duration);
  const rate = useStore((s) => s.rate);
  const sleepMinutes = useStore((s) => s.sleepMinutes);
  const sleepAtChapterEnd = useStore((s) => s.sleepAtChapterEnd);
  const togglePlay = useStore((s) => s.togglePlay);
  const seekTo = useStore((s) => s.seekTo);
  const skipBy = useStore((s) => s.skipBy);
  const setRate = useStore((s) => s.setRate);
  const setSleep = useStore((s) => s.setSleep);
  const nextChapter = useStore((s) => s.nextChapter);
  const prevChapter = useStore((s) => s.prevChapter);
  const [barWidth, setBarWidth] = useState(1);

  if (!track) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Nothing playing yet</Text>
        <Text style={styles.emptyText}>
          Pick a chapter from the Bible tab — or start with Genesis 1 — and
          hear it read by a real human voice.
        </Text>
        <Pressable style={styles.goldBtn} onPress={() => router.push('/bible')}>
          <Text style={styles.goldBtnText}>Open the Bible</Text>
        </Pressable>
      </View>
    );
  }

  const info = translationInfo(track.translation);
  const pct = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.book}>
        {track.bookName} {track.chapter}
      </Text>
      <Text style={styles.meta}>
        {info.name} · Narrated by {info.narrator}
      </Text>
      <Text style={styles.human}>100% HUMAN — NO AI VOICES</Text>

      {status === 'unavailable' ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>This chapter’s audio is being prepared</Text>
          <Text style={styles.noticeText}>
            Our human-narrated library is rolling out book by book. The text is
            ready now — tap Read Along — and Genesis 1–3 (ASV) already play
            fully offline.
          </Text>
        </View>
      ) : null}

      <Pressable
        style={styles.barOuter}
        onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (duration > 0) seekTo((e.nativeEvent.locationX / barWidth) * duration);
        }}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
      </Pressable>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <CtrlBtn icon="backward.end.fill" label="|◀" onPress={prevChapter} />
        <CtrlBtn icon="gobackward.15" label="-15" onPress={() => skipBy(-15)} />
        <CtrlBtn
          icon={status === 'playing' ? 'pause.fill' : 'play.fill'}
          label={status === 'playing' ? 'II' : '▶'}
          onPress={togglePlay}
          big
        />
        <CtrlBtn icon="goforward.30" label="+30" onPress={() => skipBy(30)} />
        <CtrlBtn icon="forward.end.fill" label="▶|" onPress={nextChapter} />
      </View>

      <Text style={styles.groupLabel}>PLAYBACK SPEED</Text>
      <View style={styles.chips}>
        {SPEEDS.map((r) => (
          <Pressable
            key={r}
            style={[styles.chip, rate === r && styles.chipActive]}
            onPress={() => setRate(r)}>
            <Text style={[styles.chipText, rate === r && styles.chipTextActive]}>
              {r}x
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.groupLabel}>SLEEP TIMER</Text>
      <View style={styles.chips}>
        {SLEEPS.map((s) => {
          const active = s.chapterEnd
            ? sleepAtChapterEnd
            : sleepMinutes === s.minutes && !sleepAtChapterEnd;
          return (
            <Pressable
              key={s.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSleep(s.minutes, !!s.chapterEnd)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        testID="read-along"
        style={styles.readAlong}
        onPress={() =>
          router.push({
            pathname: '/read/[book]/[chapter]',
            params: { book: track.bookCode, chapter: String(track.chapter) },
          })
        }>
        <Text style={styles.readAlongText}>Read along — {track.bookName} {track.chapter}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 22, paddingBottom: 44 },
  empty: {
    flex: 1,
    backgroundColor: Palette.navy900,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emptyTitle: { color: Palette.parchment, fontSize: 22, fontWeight: '700' },
  emptyText: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  goldBtn: {
    backgroundColor: Palette.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  goldBtnText: { color: Palette.navy900, fontWeight: '700', fontSize: 15 },
  book: {
    color: Palette.parchment,
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  meta: { color: Palette.muted, fontSize: 14, textAlign: 'center', marginTop: 8 },
  human: {
    color: Palette.goldLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 10,
  },
  notice: {
    backgroundColor: Palette.navy800,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
  },
  noticeTitle: { color: Palette.gold, fontSize: 15, fontWeight: '700' },
  noticeText: { color: Palette.parchment, fontSize: 14, lineHeight: 20, marginTop: 6 },
  barOuter: {
    height: 26,
    justifyContent: 'center',
    marginTop: 28,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.gold,
    maxWidth: '100%',
  },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: Palette.muted, fontSize: 13 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  ctrl: { alignItems: 'center', justifyContent: 'center' },
  groupLabel: {
    color: Palette.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 30,
    marginBottom: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Palette.navy700,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: Palette.gold, borderColor: Palette.gold },
  chipText: { color: Palette.muted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: Palette.navy900 },
  readAlong: {
    marginTop: 34,
    borderWidth: 1,
    borderColor: Palette.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  readAlongText: { color: Palette.gold, fontWeight: '700', fontSize: 15 },
});
