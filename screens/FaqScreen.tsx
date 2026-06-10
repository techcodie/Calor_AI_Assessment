import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from '../components/GlassView';
import { colors, font, radius, space } from '../theme/theme';

const NAV_SPACE = 120;

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does this work?',
    a: "Swipe through foods and tell us how you feel about each one. We turn your choices into a personalised taste profile and meal recommendations.",
  },
  {
    q: 'What do the swipe directions mean?',
    a: '→ Right = Yes (love it)   ·   ← Left = No   ·   ↑ Up = Super Like   ·   ↓ Down = Not Sure. You can also tap the buttons.',
  },
  {
    q: 'How is my profile calculated?',
    a: 'We score your liked foods by flavour traits, food group, calories and health to build your archetype, your calorie comfort zone and a health-balance read.',
  },
  {
    q: 'Is my data stored?',
    a: 'Your choices stay on your device for this session — nothing is uploaded. (Persistent profiles are on the roadmap.)',
  },
  {
    q: 'Can I start over?',
    a: 'Anytime — tap "Start over" on your Taste Profile, or "Start" to run through the foods again.',
  },
];

/** Simple FAQ tab reachable from the bottom nav. */
export default function FaqScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>FAQ</Text>
      <Text style={styles.subtitle}>Quick answers about your taste profile</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {FAQS.map((item, i) => (
          <Animated.View key={item.q} entering={FadeInDown.delay(60 + Math.min(i, 6) * 55).duration(240)}>
            <GlassView style={styles.card}>
              <View style={styles.qRow}>
                <Ionicons name="help-circle" size={18} color={colors.green} />
                <Text style={styles.q}>{item.q}</Text>
              </View>
              <Text style={styles.a}>{item.a}</Text>
            </GlassView>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: space.xl },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: font.black,
    letterSpacing: -0.5,
    marginTop: space.sm,
  },
  subtitle: { color: colors.textDim, fontSize: 14, marginTop: 2, marginBottom: space.lg },
  scroll: { paddingBottom: NAV_SPACE, gap: space.md },
  card: { borderRadius: radius.lg, padding: space.lg },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  q: { color: colors.text, fontSize: 16, fontWeight: font.bold, flex: 1 },
  a: { color: colors.textDim, fontSize: 14, lineHeight: 21 },
});
