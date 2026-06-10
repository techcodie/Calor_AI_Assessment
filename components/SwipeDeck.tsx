import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTasteProfile } from '../context/TasteProfileContext';
import { hapticDislike, hapticLike, hapticTap } from '../utils/haptics';
import { SwipeDirection } from '../types';
import { FoodCard, FoodCardHandle } from './FoodCard';

interface SwipeDeckProps {
  /** Ref to the top card so the on-screen buttons can trigger a swipe. */
  topCardRef: React.RefObject<FoodCardHandle | null>;
}

const VISIBLE_COUNT = 3;

/**
 * Renders the visible slice of the deck as a layered stack. Only the top card
 * is interactive; the two behind it sit scaled and offset, and re-flow upward
 * as the deck advances. Swipes fire a haptic and record the decision in state.
 */
export function SwipeDeck({ topCardRef }: SwipeDeckProps) {
  const { foods, index, swipe } = useTasteProfile();

  const handleSwipe = (direction: SwipeDirection) => {
    if (direction === 'right' || direction === 'up') hapticLike();
    else if (direction === 'left') hapticDislike();
    else hapticTap();
    swipe(direction);
  };

  // Slice of upcoming cards, painted back-to-front so the top card sits on top.
  const visible = foods.slice(index, index + VISIBLE_COUNT);

  return (
    <View style={styles.deck}>
      {visible
        .map((food, i) => (
          <FoodCard
            key={food.id}
            ref={i === 0 ? topCardRef : undefined}
            food={food}
            position={i}
            isTop={i === 0}
            onSwipe={handleSwipe}
          />
        ))
        .reverse()}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
