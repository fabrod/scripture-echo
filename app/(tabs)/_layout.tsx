import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { View } from 'react-native';

import MiniPlayer from '@/components/MiniPlayer';
import { Palette } from '@/constants/Colors';

function TabIcon({ name, color }: { name: string; color: unknown }) {
  const tint = typeof color === 'string' ? color : Palette.muted;
  return (
    <SymbolView
      name={name as never}
      size={26}
      tintColor={tint}
      fallback={<View style={{ width: 26, height: 26 }} />}
    />
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: Palette.navy900 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Palette.gold,
          tabBarInactiveTintColor: Palette.muted,
          tabBarStyle: {
            backgroundColor: Palette.navy900,
            borderTopColor: Palette.navy700,
          },
          headerStyle: { backgroundColor: Palette.navy900 },
          headerTitleStyle: { color: Palette.parchment },
          headerShadowVisible: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerTitle: 'Scripture Echo',
            tabBarButtonTestID: 'tab-home',
            tabBarIcon: ({ color }) => <TabIcon name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="bible"
          options={{
            title: 'Bible',
            tabBarButtonTestID: 'tab-bible',
            tabBarIcon: ({ color }) => <TabIcon name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="listen"
          options={{
            title: 'Listen',
            tabBarButtonTestID: 'tab-listen',
            tabBarIcon: ({ color }) => (
              <TabIcon name="play.circle.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarButtonTestID: 'tab-saved',
            tabBarIcon: ({ color }) => <TabIcon name="bookmark.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarButtonTestID: 'tab-settings',
            tabBarIcon: ({ color }) => (
              <TabIcon name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
