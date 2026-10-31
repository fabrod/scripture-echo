import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Palette } from '@/constants/Colors';
import { initAudio, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Palette.navy900,
    card: Palette.navy800,
    primary: Palette.gold,
    text: Palette.parchment,
    border: Palette.navy700,
  },
};

function Loading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Palette.navy900,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator color={Palette.gold} size="large" />
    </View>
  );
}

export default function RootLayout() {
  const loadSettings = useStore((s) => s.loadSettings);

  useEffect(() => {
    void (async () => {
      await initAudio();
      await loadSettings();
      await SplashScreen.hideAsync();
    })();
  }, [loadSettings]);

  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider
        databaseName="scripture.db"
        assetSource={{ assetId: require('../assets/db/scripture.db') }}
        useSuspense>
        <ThemeProvider value={theme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Palette.navy900 },
              headerTintColor: Palette.gold,
              headerTitleStyle: { color: Palette.parchment },
              contentStyle: { backgroundColor: Palette.navy900 },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="book/[code]" options={{ title: '' }} />
            <Stack.Screen name="read/[book]/[chapter]" options={{ title: '' }} />
            <Stack.Screen name="legal" options={{ title: '' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
