import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import foodsData from '../data/foods.json';
import { Decision, Food, SwipeDirection, VERDICT_BY_DIRECTION } from '../types';

const ALL_FOODS = foodsData.foods as Food[];

interface TasteProfileState {
  foods: Food[];
  /** Index of the card currently on top of the deck. */
  index: number;
  /** Every swipe made so far, in order (used for counts + undo). */
  decisions: Decision[];

  // Derived — raw verdict buckets
  /** Swiped right (yes). */
  loves: Food[];
  /** Swiped up (super like). */
  superlikes: Food[];
  /** Swiped left (no). */
  hates: Food[];
  /** Swiped down (not sure). */
  unsures: Food[];

  // Derived — convenience aggregates (used by the taste-profile engine)
  /** Foods the user wants more of = loves + super likes. */
  likes: Food[];
  /** Foods the user rejects = hates. */
  dislikes: Food[];

  total: number;
  current: Food | null;
  remaining: number;
  isComplete: boolean;
  progress: number; // 0..1

  // Actions
  swipe: (direction: SwipeDirection) => void;
  undo: () => void;
  reset: () => void;
}

const TasteProfileContext = createContext<TasteProfileState | undefined>(undefined);

export function TasteProfileProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const swipe = useCallback(
    (direction: SwipeDirection) => {
      setIndex((i) => {
        const food = ALL_FOODS[i];
        if (!food) return i; // deck already exhausted
        setDecisions((d) => [...d, { food, direction, verdict: VERDICT_BY_DIRECTION[direction] }]);
        return i + 1;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setDecisions((d) => {
      if (d.length === 0) return d;
      setIndex((i) => Math.max(0, i - 1));
      return d.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    setIndex(0);
    setDecisions([]);
  }, []);

  const value = useMemo<TasteProfileState>(() => {
    const byVerdict = (v: Decision['verdict']) =>
      decisions.filter((d) => d.verdict === v).map((d) => d.food);
    const loves = byVerdict('yes');
    const superlikes = byVerdict('superlike');
    const hates = byVerdict('no');
    const unsures = byVerdict('unsure');
    const total = ALL_FOODS.length;
    return {
      foods: ALL_FOODS,
      index,
      decisions,
      loves,
      superlikes,
      hates,
      unsures,
      likes: [...loves, ...superlikes],
      dislikes: hates,
      total,
      current: ALL_FOODS[index] ?? null,
      remaining: total - index,
      isComplete: index >= total,
      progress: total === 0 ? 0 : index / total,
      swipe,
      undo,
      reset,
    };
  }, [index, decisions, swipe, undo, reset]);

  return <TasteProfileContext.Provider value={value}>{children}</TasteProfileContext.Provider>;
}

export function useTasteProfile(): TasteProfileState {
  const ctx = useContext(TasteProfileContext);
  if (!ctx) {
    throw new Error('useTasteProfile must be used within a TasteProfileProvider');
  }
  return ctx;
}
