import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/Colors';
import { formatTime } from '@/lib/format';
import { useStore } from '@/lib/store';

/** Slim now-playing bar above the tab bar; hidden when nothing is loaded. */
export default function MiniPlayer() {
  const track = useStore((s) => s.track);
  const status = useStore((s) => s.status);
  const position = useStore((s) => s.position);
  const duration = useStore((s) => s.duration);
  const togglePlay = useStore((s) => s.togglePlay);

  if (!track) return null;
  const pct = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.main} onPress={() => router.push('/listen')}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {track.bookName} {track.chapter} · {track.translation}
          </Text>
          <Text style={styles.sub}>
            {status === 'unavailable'
              ? 'Audio being prepared'
              : `${formatTime(position)} / ${formatTime(duration)}`}
          </Text>
        </View>
        <Pressable
          style={styles.btn}
          onPress={(e) => {
            e.stopPropagation();
            togglePlay();
          }}>
          <SymbolView
            name={status === 'playing' ? 'pause.fill' : 'play.fill'}
            size={20}
            tintColor={Palette.navy900}
            fallback={<Text style={styles.btnText}>{status === 'playing' ? 'II' : '▶'}</Text>}
          />
        </Pressable>
      </Pressable>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.navy800,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.navy700,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  title: { color: Palette.parchment, fontSize: 15, fontWeight: '600' },
  sub: { color: Palette.muted, fontSize: 12, marginTop: 2 },
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Palette.navy900, fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 3, backgroundColor: Palette.navy700 },
  progressFill: { height: 3, backgroundColor: Palette.gold },
});
