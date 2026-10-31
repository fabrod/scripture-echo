import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/Colors';
import { PRIVACY_POLICY, TERMS_OF_USE } from '@/lib/legal';

/** Minimal markdown renderer for the embedded legal documents (exact text). */
function renderMarkdown(md: string) {
  return md.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return (
        <Text key={i} style={styles.h1}>
          {line.slice(2)}
        </Text>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <Text key={i} style={styles.h2}>
          {line.slice(3)}
        </Text>
      );
    }
    if (line.trim() === '') return <Text key={i} style={styles.spacer} />;
    const clean = line.replace(/\*\*/g, '');
    return (
      <Text key={i} style={styles.body}>
        {clean}
      </Text>
    );
  });
}

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const navigation = useNavigation();
  const isPrivacy = doc !== 'terms';

  useEffect(() => {
    navigation.setOptions({ title: isPrivacy ? 'Privacy Policy' : 'Terms of Use' });
  }, [navigation, isPrivacy]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {renderMarkdown(isPrivacy ? PRIVACY_POLICY : TERMS_OF_USE)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.navy900 },
  content: { padding: 20, paddingBottom: 44 },
  h1: {
    color: Palette.gold,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  h2: {
    color: Palette.goldLight,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  body: { color: Palette.parchment, fontSize: 15, lineHeight: 22 },
  spacer: { height: 8 },
});
