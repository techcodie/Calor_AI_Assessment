import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Thin wrappers around expo-haptics.
 *
 * Haptics are a no-op (and unsupported) on web, and any failure here should
 * never bubble up into the UI, so every call is guarded and swallowed.
 */

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export function hapticLike() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticDislike() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
}

export function hapticTap() {
  if (!enabled) return;
  Haptics.selectionAsync().catch(() => {});
}

export function hapticUndo() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
