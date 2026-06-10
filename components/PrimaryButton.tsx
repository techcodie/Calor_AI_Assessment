import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, font, gradients, radius, shadow, space } from '../theme/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: object;
}

/** The app's main green gradient call-to-action, with a springy press state. */
export function PrimaryButton({ label, onPress, icon = 'arrow-forward', style }: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
      }}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={[styles.shadow, shadow.greenGlow, animatedStyle]}>
        <LinearGradient
          colors={gradients.cta}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.label}>{label}</Text>
          <Ionicons name={icon} size={20} color={colors.bg0} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: radius.pill },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    height: 60,
    borderRadius: radius.pill,
    paddingHorizontal: space.xxl,
  },
  label: { color: colors.bg0, fontSize: 17, fontWeight: font.black, letterSpacing: 0.3 },
});
