import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/theme';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  /** Use the brighter translucent fill (for elevated surfaces like the nav bar). */
  bright?: boolean;
  /**
   * Opt in to a real native blur on iOS. Off by default for performance: a real
   * BlurView is expensive, and stacking many of them (e.g. a list of cards) is
   * the classic cause of dropped frames. We reserve true blur for a handful of
   * signature, single-instance surfaces (the nav bar, the completion card) and
   * let everything else use the translucent frosted fill below — which still
   * reads as glass against the dark gradient.
   */
  blur?: boolean;
}

/**
 * Frosted-glass surface with a deliberate cross-platform strategy:
 *
 *  - iOS + `blur`  -> real native blur via expo-blur's BlurView, with a
 *           translucent fill + hairline border on top for the frosted look.
 *  - Everything else (iOS without `blur`, Android, web) -> a semi-transparent
 *           solid layer that reads as glass against the dark gradient. Same
 *           border + radius, so the UI never looks broken.
 *
 * Android native blur is unreliable / janky, so it always uses the solid
 * fallback — the behaviour CalorAI specifically asks candidates to handle. We
 * extend that same fallback to most iOS surfaces purely to keep 60fps.
 */
export function GlassView({
  children,
  style,
  intensity = 28,
  tint = 'dark',
  bright = false,
  blur = false,
}: GlassViewProps) {
  const overlay = bright ? colors.glassFillStrong : colors.glassFill;
  const borderColor = bright ? colors.glassBorderStrong : colors.glassBorder;

  if (Platform.OS === 'ios' && blur) {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.base, { borderColor }, style]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlay }]} pointerEvents="none" />
        {children}
      </BlurView>
    );
  }

  // Solid translucent glass (iOS without blur, Android, web).
  const solidFill = bright ? colors.glassFillAndroidLight : colors.glassFillAndroid;
  return (
    <View style={[styles.base, { backgroundColor: solidFill, borderColor }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
});
