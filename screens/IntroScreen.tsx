import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from '../components/GlassView';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, font, radius, space } from '../theme/theme';
import { hapticTap } from '../utils/haptics';

interface StartScreenProps {
  /** Launch the swipe flow. */
  onStart: () => void;
}

/**
 * The "Start" tab — the Figma welcome: a "Design Your Food Plan" header above a
 * single glass card that introduces the taste-profile flow and kicks off swiping.
 */
export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.Text entering={FadeIn.duration(500)} style={styles.screenTitle}>
        Design Your Food Plan
      </Animated.Text>

      <View style={styles.cardWrap}>
        <Animated.View entering={FadeInDown.delay(120).springify().damping(16)} style={styles.cardOuter}>
          <GlassView blur style={styles.card}>
            <Text style={styles.emoji}>😋</Text>
            <Text style={styles.cardTitle}>Build Your Taste Profile</Text>
            <Text style={styles.cardCopy}>
              Swipe right on foods you love, left on foods you don't.
            </Text>
            <Text style={styles.cardSub}>This helps us recommend meals you'll love eating.</Text>

            <View style={styles.btnWrap}>
              <PrimaryButton
                label="Start Swiping"
                icon="arrow-forward"
                onPress={() => {
                  hapticTap();
                  onStart();
                }}
              />
            </View>
            <Text style={styles.hint}>Takes about 2 minutes.</Text>
          </GlassView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: space.xl },
  screenTitle: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: font.black,
    letterSpacing: -0.8,
    marginTop: space.lg,
  },
  cardWrap: { flex: 1, justifyContent: 'center', paddingBottom: 90 },
  cardOuter: { borderRadius: radius.xxl },
  card: {
    borderRadius: radius.xxl,
    paddingVertical: space.xxxl,
    paddingHorizontal: space.xl,
    alignItems: 'center',
  },
  emoji: { fontSize: 64, marginBottom: space.lg },
  cardTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: font.black,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  cardCopy: {
    color: colors.textDim,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: space.md,
    paddingHorizontal: space.sm,
  },
  cardSub: {
    color: colors.textFaint,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: space.lg,
    paddingHorizontal: space.sm,
  },
  btnWrap: { width: '100%', marginTop: space.xxl },
  hint: { color: colors.textFaint, fontSize: 13, fontWeight: font.medium, marginTop: space.lg },
});
