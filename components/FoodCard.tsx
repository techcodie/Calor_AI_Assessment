import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, font, radius, shadow, space, spring } from '../theme/theme';
import { Food, SwipeDirection } from '../types';
import { healthRating } from '../utils/nutrition';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const CARD_W = SCREEN_W - space.xl * 2;
export const CARD_H = Math.min(SCREEN_H * 0.54, 500);

const SWIPE_THRESHOLD = SCREEN_W * 0.26;
const SWIPE_THRESHOLD_Y = SCREEN_H * 0.16;
const FLING_X = SCREEN_W * 1.5;
const FLING_Y = SCREEN_H * 1.2;

export interface FoodCardHandle {
  /** Programmatically fling the card off-screen (used by the tap buttons). */
  swipe: (direction: SwipeDirection) => void;
}

interface FoodCardProps {
  food: Food;
  /** 0 = top/interactive, 1 = next, 2 = behind. */
  position: number;
  isTop: boolean;
  onSwipe: (direction: SwipeDirection) => void;
}

/**
 * A single statement card ("I love eating <food>").
 *
 * The top card is draggable in all four directions: → yes, ← no, ↑ super like,
 * ↓ not sure. A Reanimated pan gesture drives translateX/Y, the card tilts with
 * horizontal drag, and the matching verdict badge fades in. Past the threshold
 * (or with enough velocity) the card flings off in that direction and reports
 * it; otherwise it springs back. Cards behind it sit in a scaled, offset stack
 * that re-flows with a spring as the deck advances.
 */
export const FoodCard = forwardRef<FoodCardHandle, FoodCardProps>(
  ({ food, position, isTop, onSwipe }, ref) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const stackPos = useSharedValue(position);

    const health = healthRating(food.healthScore);

    useEffect(() => {
      stackPos.value = withSpring(position, spring);
    }, [position, stackPos]);

    // Imperative fling (driven by the on-screen buttons, JS thread).
    const fling = (direction: SwipeDirection) => {
      const done = (finished?: boolean) => {
        'worklet';
        if (finished) runOnJS(onSwipe)(direction);
      };
      if (direction === 'right' || direction === 'left') {
        translateX.value = withTiming(direction === 'right' ? FLING_X : -FLING_X, { duration: 280 }, done);
      } else {
        translateY.value = withTiming(direction === 'up' ? -FLING_Y : FLING_Y, { duration: 280 }, done);
      }
    };

    useImperativeHandle(ref, () => ({ swipe: fling }), [onSwipe]);

    const pan = Gesture.Pan()
      .enabled(isTop)
      .onUpdate((e) => {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      })
      .onEnd((e) => {
        const absX = Math.abs(e.translationX);
        const absY = Math.abs(e.translationY);

        // Whichever axis the user committed to wins.
        if (absX >= absY) {
          if (absX > SWIPE_THRESHOLD || Math.abs(e.velocityX) > 800) {
            const direction: SwipeDirection = e.translationX > 0 ? 'right' : 'left';
            translateX.value = withTiming(
              direction === 'right' ? FLING_X : -FLING_X,
              { duration: 220 },
              (finished) => {
                if (finished) runOnJS(onSwipe)(direction);
              },
            );
            return;
          }
        } else if (absY > SWIPE_THRESHOLD_Y || Math.abs(e.velocityY) > 800) {
          const direction: SwipeDirection = e.translationY > 0 ? 'down' : 'up';
          translateY.value = withTiming(
            direction === 'up' ? -FLING_Y : FLING_Y,
            { duration: 220 },
            (finished) => {
              if (finished) runOnJS(onSwipe)(direction);
            },
          );
          return;
        }

        translateX.value = withSpring(0, spring);
        translateY.value = withSpring(0, spring);
      });

    const cardStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        translateX.value,
        [-SCREEN_W, 0, SCREEN_W],
        [-12, 0, 12],
        Extrapolation.CLAMP,
      );
      const scale = interpolate(stackPos.value, [0, 1, 2], [1, 0.93, 0.86], Extrapolation.CLAMP);
      const offsetY = interpolate(stackPos.value, [0, 1, 2], [0, 20, 38], Extrapolation.CLAMP);
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value + offsetY },
          { rotate: `${rotate}deg` },
          { scale },
        ],
      };
    });

    // Each verdict badge fades in as the drag commits to its direction.
    const yesStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [16, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    }));
    const noStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -16], [1, 0], Extrapolation.CLAMP),
    }));
    const superStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateY.value, [-SWIPE_THRESHOLD_Y, -16], [1, 0], Extrapolation.CLAMP),
    }));
    const unsureStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateY.value, [16, SWIPE_THRESHOLD_Y], [0, 1], Extrapolation.CLAMP),
    }));

    return (
      <View style={styles.absoluteCenter} pointerEvents={isTop ? 'auto' : 'none'}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, shadow.card, cardStyle]}>
            {/* Ambient backdrop: a blurred copy of the photo so the card glows
                with the food's own colour instead of flat black. */}
            <Image
              source={food.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              blurRadius={38}
              cachePolicy="memory-disk"
              recyclingKey={`${food.id}-bg`}
            />
            <View style={styles.cardTint} />

            {/* Verdict badges */}
            <Animated.View style={[styles.badge, styles.badgeNo, noStyle]}>
              <Text style={styles.badgeText}>No</Text>
            </Animated.View>
            <Animated.View style={[styles.badge, styles.badgeYes, yesStyle]}>
              <Text style={styles.badgeText}>Yes</Text>
            </Animated.View>
            <Animated.View style={[styles.badge, styles.badgeSuper, superStyle]}>
              <Text style={[styles.badgeText, { color: colors.white }]}>Super Like ⭐️</Text>
            </Animated.View>
            <Animated.View style={[styles.badge, styles.badgeUnsure, unsureStyle]}>
              <Text style={styles.badgeText}>Not Sure</Text>
            </Animated.View>

            {/* Statement content */}
            <View style={styles.body}>
              <View style={styles.imageRing}>
                <Image
                  source={food.image}
                  style={styles.imageCircle}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                  recyclingKey={String(food.id)}
                />
              </View>

              <Text style={styles.statement}>I love eating {food.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="flame" size={13} color={colors.flame} />
                  <Text style={styles.metaText}>{food.calories} cal</Text>
                </View>
                <View style={[styles.metaPill, { borderColor: health.color }]}>
                  <View style={[styles.metaDot, { backgroundColor: health.color }]} />
                  <Text style={[styles.metaText, { color: health.color }]}>{health.label}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
);

FoodCard.displayName = 'FoodCard';

const styles = StyleSheet.create({
  absoluteCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radius.xxl,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,8,10,0.55)' },
  body: { alignItems: 'center', paddingHorizontal: space.xl },
  imageRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...shadow.soft,
  },
  imageCircle: { width: '100%', height: '100%', borderRadius: 80 },
  statement: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: font.black,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: space.xl,
  },
  metaRow: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  metaText: { color: colors.text, fontSize: 12.5, fontWeight: font.bold },
  metaDot: { width: 7, height: 7, borderRadius: 4 },

  // Verdict badges
  badge: {
    position: 'absolute',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...shadow.soft,
  },
  badgeText: { color: colors.bg0, fontSize: 17, fontWeight: font.black, letterSpacing: 0.3 },
  badgeNo: {
    top: 26,
    left: 22,
    backgroundColor: colors.dislike,
    transform: [{ rotate: '-12deg' }],
  },
  badgeYes: {
    top: 26,
    right: 22,
    backgroundColor: colors.like,
    transform: [{ rotate: '12deg' }],
  },
  badgeSuper: {
    top: 22,
    alignSelf: 'center',
    backgroundColor: colors.superlike,
  },
  badgeUnsure: {
    bottom: 26,
    alignSelf: 'center',
    backgroundColor: colors.notsure,
  },
});
