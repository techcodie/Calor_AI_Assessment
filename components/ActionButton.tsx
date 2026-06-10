import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, font, shadow, space } from '../theme/theme';

type Variant = 'dislike' | 'notsure' | 'superlike' | 'like' | 'undo';

interface ActionButtonProps {
  variant: Variant;
  onPress: () => void;
  disabled?: boolean;
  /** 'lg' for the primary yes/no, 'md' for the secondary super-like / not-sure. */
  size?: 'lg' | 'md';
  /** Optional caption rendered under the button (e.g. "Super Like"). */
  label?: string;
}

const CONFIG: Record<
  Variant,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; glow: object }
> = {
  dislike: { icon: 'close', bg: colors.dislike, glow: shadow.dislikeGlow },
  notsure: { icon: 'help', bg: colors.notsure, glow: shadow.soft },
  superlike: { icon: 'star', bg: colors.superlike, glow: shadow.superGlow },
  like: { icon: 'heart', bg: colors.like, glow: shadow.greenGlow },
  undo: { icon: 'arrow-undo', bg: 'rgba(26, 26, 30, 0.92)', glow: shadow.soft },
};

/**
 * Circular tap target for the swipe screen — a solid, glowing colour disc with
 * a white glyph, mirroring the Figma. Springs down on press and drives the same
 * card animation as the matching swipe direction, so buttons and gestures are
 * never two divergent code paths. An optional caption sits underneath.
 */
export function ActionButton({
  variant,
  onPress,
  disabled = false,
  size = 'lg',
  label,
}: ActionButtonProps) {
  const cfg = CONFIG[variant];
  const scale = useSharedValue(1);
  const dim = size === 'lg' ? 64 : 52;
  const iconSize = size === 'lg' ? 28 : 22;
  const iconColor = variant === 'undo' ? colors.textDim : colors.white;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.wrap}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.86, { damping: 14, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 260 });
        }}
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}
      >
        <Animated.View
          style={[
            styles.button,
            cfg.glow,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: cfg.bg,
              opacity: disabled ? 0.4 : 1,
            },
            animatedStyle,
          ]}
        >
          <Ionicons name={cfg.icon} size={iconSize} color={iconColor} />
        </Animated.View>
      </Pressable>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.sm },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  label: { color: colors.textFaint, fontSize: 11, fontWeight: font.semibold },
});
