import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';
import { FoodCardHandle } from '../components/FoodCard';
import { GlassView } from '../components/GlassView';
import { GradientBackground } from '../components/GradientBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { SwipeDeck } from '../components/SwipeDeck';
import { useTasteProfile } from '../context/TasteProfileContext';
import { colors, font, radius, space } from '../theme/theme';
import { SwipeDirection } from '../types';
import { hapticTap, hapticUndo } from '../utils/haptics';

interface SwipeScreenProps {
  /** Exit the swipe flow, back to the Start tab. */
  onBack: () => void;
  /** Jump to the Taste Profile (results) tab. */
  onSeeProfile: () => void;
}

/** The swipe deck flow: top progress, the statement-card stack, 4 verdict buttons. */
export default function SwipeScreen({ onBack, onSeeProfile }: SwipeScreenProps) {
  const { current, index, total, progress, likes, isComplete, decisions, undo } = useTasteProfile();

  const topCardRef = useRef<FoodCardHandle | null>(null);
  // Prevents a double-record if the user taps a button twice mid-fling.
  const lock = useRef(false);

  useEffect(() => {
    lock.current = false;
  }, [index]);

  const trigger = (direction: SwipeDirection) => {
    if (lock.current || !current) return;
    lock.current = true;
    topCardRef.current?.swipe(direction);
  };

  const onUndo = () => {
    if (decisions.length === 0) return;
    hapticUndo();
    undo();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar: back · progress · undo */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            hapticTap();
            onBack();
          }}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} current={index} total={total} compact />
        </View>

        <Pressable
          onPress={onUndo}
          disabled={decisions.length === 0}
          hitSlop={10}
          style={[styles.iconBtn, { opacity: decisions.length === 0 ? 0.35 : 1 }]}
        >
          <Ionicons name="arrow-undo" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Deck or completion state */}
      <View style={styles.deckArea}>
        {isComplete ? (
          <CompleteState liked={likes.length} onSeeProfile={onSeeProfile} onUndo={onUndo} />
        ) : (
          <SwipeDeck topCardRef={topCardRef} />
        )}
      </View>

      {/* 4-way controls */}
      {!isComplete && (
        <Animated.View entering={FadeIn} style={styles.controls}>
          <ActionButton variant="dislike" size="lg" label="Swipe Left" onPress={() => trigger('left')} disabled={!current} />
          <ActionButton variant="notsure" size="md" label="Not Sure" onPress={() => trigger('down')} disabled={!current} />
          <ActionButton variant="superlike" size="md" label="Super Like" onPress={() => trigger('up')} disabled={!current} />
          <ActionButton variant="like" size="lg" label="Swipe Right" onPress={() => trigger('right')} disabled={!current} />
        </Animated.View>
      )}
      </SafeAreaView>
    </GradientBackground>
  );
}

function CompleteState({
  liked,
  onSeeProfile,
  onUndo,
}: {
  liked: number;
  onSeeProfile: () => void;
  onUndo: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(420)} style={styles.complete}>
      <GlassView blur style={styles.completeCard}>
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-done" size={30} color={colors.bg0} />
        </View>
        <Text style={styles.completeTitle}>All done!</Text>
        <Text style={styles.completeText}>
          You loved {liked} {liked === 1 ? 'food' : 'foods'}. Your taste profile is ready.
        </Text>
        <View style={styles.completeButton}>
          <PrimaryButton label="See your profile" icon="sparkles" onPress={onSeeProfile} />
        </View>
        <Text style={styles.undoLink} onPress={onUndo}>
          Undo last swipe
        </Text>
      </GlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: space.xl },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  progressWrap: { flex: 1 },

  deckArea: { flex: 1, marginTop: space.lg },

  controls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: space.lg,
    paddingBottom: space.xxl,
    paddingTop: space.sm,
  },

  complete: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  completeCard: {
    width: '100%',
    borderRadius: radius.xxl,
    padding: space.xl,
    alignItems: 'center',
  },
  completeBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  completeTitle: { color: colors.text, fontSize: 26, fontWeight: font.black },
  completeText: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: space.sm,
  },
  completeButton: { width: '100%', marginTop: space.xl },
  undoLink: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: font.semibold,
    marginTop: space.lg,
  },
});
