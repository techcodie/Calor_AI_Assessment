import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, font, gradients, radius, space, spring } from '../theme/theme';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  current: number;
  total: number;
  /** Thin, label-less bar (used at the top of the swipe screen). */
  compact?: boolean;
}

/**
 * Slim progress track with a spring-animated green fill and a soft glow at the
 * leading edge. Updates every time the user swipes. In `compact` mode it drops
 * the label/count and renders as a thin top bar to match the Figma.
 */
export function ProgressBar({ progress, current, total, compact = false }: ProgressBarProps) {
  const width = useSharedValue(progress);

  useEffect(() => {
    width.value = withSpring(progress, spring);
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, width.value * 100))}%`,
  }));

  return (
    <View style={styles.wrap}>
      {!compact && (
        <View style={styles.header}>
          <Text style={styles.label}>Tasting progress</Text>
          <Text style={styles.count}>
            <Text style={styles.countStrong}>{Math.min(current, total)}</Text> / {total}
          </Text>
        </View>
      )}
      <View style={[styles.track, compact && styles.trackCompact]}>
        <Animated.View style={[styles.fillWrap, fillStyle]}>
          <LinearGradient
            colors={gradients.progress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: font.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  count: { color: colors.textDim, fontSize: 13, fontWeight: font.medium },
  countStrong: { color: colors.green, fontWeight: font.bold },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  trackCompact: { height: 5 },
  fillWrap: {
    height: '100%',
    borderRadius: radius.pill,
    shadowColor: colors.green,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  fill: { flex: 1, borderRadius: radius.pill },
});
