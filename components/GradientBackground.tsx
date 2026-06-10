import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, gradients } from '../theme/theme';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  /** Use the slightly lifted intro variant. */
  intro?: boolean;
}

/**
 * Full-screen near-black background with one soft, static green glow.
 *
 * Deliberately static: an earlier version animated two full-screen gradient
 * washes on an infinite loop, which forced a continuous full-screen GPU
 * recomposite on every screen (and stole frames from the Results ScrollView and
 * the swipe gesture). A single fixed glow reads the same against the dark base
 * but costs nothing per frame, so scrolling and swiping stay smooth at 60fps.
 */
export function GradientBackground({ children, intro = false }: GradientBackgroundProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={intro ? gradients.screenIntro : gradients.screen}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Soft green glow — bottom-centre, like the Figma swipe screen. */}
      <LinearGradient
        colors={[colors.greenSoft, 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
});
