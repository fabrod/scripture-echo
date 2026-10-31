/**
 * Scripture Echo — app state (Zustand): settings + the audio player.
 *
 * The player is a single app-wide instance (createAudioPlayer) so playback
 * continues across screens and in the background. Human narration only —
 * sources are bundled LibriVox chapter files or the hosted library.
 */
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';
import { create } from 'zustand';

import { bundledChapter } from './bundledAudio';
import {
  remoteChapterUrl,
  translationInfo,
  type TranslationCode,
} from './config';
import { getSetting, recordHistory, setSetting } from './userdb';

export interface Track {
  translation: TranslationCode;
  bookCode: string;
  bookName: string;
  chapter: number;
  totalChapters: number;
}

export type PlayerStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'unavailable';

interface PlayerState {
  track: Track | null;
  status: PlayerStatus;
  position: number;
  duration: number;
  rate: number;
  sleepMinutes: number | null;
  sleepAtChapterEnd: boolean;
}

interface SettingsState {
  translation: TranslationCode;
  fontScale: number;
}

interface Store extends PlayerState, SettingsState {
  _setPlayer: (patch: Partial<PlayerState>) => void;
  loadSettings: () => Promise<void>;
  setTranslation: (t: TranslationCode) => Promise<void>;
  setFontScale: (s: number) => Promise<void>;
  loadTrack: (track: Track, opts?: { autoplay?: boolean; resumeSec?: number }) => void;
  togglePlay: () => void;
  seekTo: (sec: number) => void;
  skipBy: (deltaSec: number) => void;
  setRate: (r: number) => void;
  setSleep: (minutes: number | null, atChapterEnd?: boolean) => void;
  nextChapter: () => void;
  prevChapter: () => void;
}

let player: AudioPlayer | null = null;
let sleepTimer: ReturnType<typeof setTimeout> | null = null;
let lastHistoryWrite = 0;

function ensurePlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null, { updateInterval: 500 });
    player.muted = false;
    player.volume = 1;
    player.addListener('playbackStatusUpdate', onStatus);
  }
  return player;
}

function onStatus(status: AudioStatus) {
  const s = useStore.getState();
  if (!s.track) return;
  if (status.error) {
    s._setPlayer({ status: 'unavailable' });
    return;
  }
  s._setPlayer({
    position: status.currentTime ?? 0,
    duration: status.duration ?? 0,
    status: status.playing ? 'playing' : s.status === 'loading' ? 'loading' : 'paused',
  });
  const now = Date.now();
  if (status.playing && now - lastHistoryWrite > 10000) {
    lastHistoryWrite = now;
    void recordHistory({
      translation: s.track.translation,
      book_code: s.track.bookCode,
      book_name: s.track.bookName,
      chapter: s.track.chapter,
      position_sec: status.currentTime ?? 0,
      duration_sec: status.duration ?? 0,
    });
  }
  if (status.didJustFinish) {
    if (s.sleepAtChapterEnd) {
      s._setPlayer({ status: 'paused', sleepAtChapterEnd: false });
      return;
    }
    if (s.track.chapter < s.track.totalChapters) {
      s.nextChapter();
    } else {
      s._setPlayer({ status: 'paused', position: 0 });
    }
  }
}

export const useStore = create<Store>()((set, get) => ({
  // settings
  translation: 'ASV',
  fontScale: 1,
  // player
  track: null,
  status: 'idle',
  position: 0,
  duration: 0,
  rate: 1,
  sleepMinutes: null,
  sleepAtChapterEnd: false,

  // internal
  _setPlayer: (patch: Partial<PlayerState>) => set(patch as Partial<Store>),

  loadSettings: async () => {
    const [t, fs] = await Promise.all([
      getSetting('translation'),
      getSetting('fontScale'),
    ]);
    set({
      translation: (t as TranslationCode) || 'ASV',
      fontScale: fs ? Number(fs) || 1 : 1,
    });
  },

  setTranslation: async (t) => {
    set({ translation: t });
    await setSetting('translation', t);
  },

  setFontScale: async (s) => {
    set({ fontScale: s });
    await setSetting('fontScale', String(s));
  },

  loadTrack: (track, opts) => {
    const p = ensurePlayer();
    const bundled = bundledChapter(track.translation, track.bookCode, track.chapter);
    const source = bundled ?? {
      uri: remoteChapterUrl(track.translation, track.bookCode, track.chapter),
    };
    set({ track, status: 'loading', position: 0, duration: 0 });
    p.replace(source);
    p.setActiveForLockScreen(true, {
      title: `${track.bookName} ${track.chapter}`,
      artist: translationInfo(track.translation).narrator,
      albumTitle: `Scripture Echo — ${track.translation}`,
    });
    if (opts?.resumeSec && opts.resumeSec > 0) {
      void p.seekTo(opts.resumeSec).catch(() => undefined);
    }
    if (opts?.autoplay !== false) p.play();
    void recordHistory({
      translation: track.translation,
      book_code: track.bookCode,
      book_name: track.bookName,
      chapter: track.chapter,
      position_sec: opts?.resumeSec ?? 0,
      duration_sec: 0,
    });
  },

  togglePlay: () => {
    const p = ensurePlayer();
    if (get().status === 'playing') {
      p.pause();
      set({ status: 'paused' });
    } else if (get().track) {
      p.play();
      set({ status: 'playing' });
    }
  },

  seekTo: (sec) => {
    void ensurePlayer().seekTo(Math.max(0, sec)).catch(() => undefined);
  },

  skipBy: (delta) => {
    const { position } = get();
    get().seekTo(position + delta);
  },

  setRate: (r) => {
    const p = ensurePlayer();
    p.playbackRate = r;
    p.shouldCorrectPitch = true;
    set({ rate: r });
  },

  setSleep: (minutes, atChapterEnd = false) => {
    if (sleepTimer) clearTimeout(sleepTimer);
    sleepTimer = null;
    set({ sleepMinutes: minutes, sleepAtChapterEnd: atChapterEnd });
    if (minutes != null) {
      sleepTimer = setTimeout(() => {
        ensurePlayer().pause();
        set({ status: 'paused', sleepMinutes: null });
      }, minutes * 60 * 1000);
    }
  },

  nextChapter: () => {
    const { track } = get();
    if (track && track.chapter < track.totalChapters) {
      get().loadTrack({ ...track, chapter: track.chapter + 1 });
    }
  },

  prevChapter: () => {
    const { track, position } = get();
    if (!track) return;
    if (position > 5) {
      get().seekTo(0);
    } else if (track.chapter > 1) {
      get().loadTrack({ ...track, chapter: track.chapter - 1 });
    }
  },
}));

/** Call once at app start: background-capable, plays in silent mode. */
export async function initAudio(): Promise<void> {
  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });
}
