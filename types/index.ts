// Shared domain types for the whole app.

export type FoodCategory = 'protein' | 'carb' | 'vegetable' | 'other';

export interface Food {
  id: number;
  name: string;
  image: string;
  category: FoodCategory | string;
  tags: string[];
  /** Approximate calories per serving (kcal). */
  calories: number;
  /** How good the food is for you, 0–100 (higher = healthier). */
  healthScore: number;
}

export interface Cuisine {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

/** The four swipe directions the card responds to. */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * What a swipe means:
 *  → right = yes (love), ← left = no (hate),
 *  ↑ up = super like, ↓ down = not sure.
 */
export type Verdict = 'yes' | 'no' | 'superlike' | 'unsure';

/** Maps a swipe direction to its verdict. */
export const VERDICT_BY_DIRECTION: Record<SwipeDirection, Verdict> = {
  right: 'yes',
  left: 'no',
  up: 'superlike',
  down: 'unsure',
};

/** A single recorded choice the user made on a food card. */
export interface Decision {
  food: Food;
  direction: SwipeDirection;
  verdict: Verdict;
}

export type TabKey = 'start' | 'faq' | 'profile';

/** A single derived personality trait shown on the results screen. */
export interface TasteTrait {
  key: string;
  label: string;
  emoji: string;
  /** 0–100 strength of this trait within the user's likes. */
  score: number;
}

/** Per-category share of the user's liked foods. */
export interface MacroSlice {
  category: FoodCategory;
  label: string;
  count: number;
  percent: number; // 0–100
  color: string;
}

export interface CuisineAffinity {
  name: string;
  emoji: string;
  count: number;
}

/** The full computed taste profile rendered on the results screen. */
export interface TasteProfile {
  archetype: string;
  tagline: string;
  description: string;
  emoji: string;
  traits: TasteTrait[];
  macros: MacroSlice[];
  topCuisine: CuisineAffinity | null;
  likedCount: number;
  dislikedCount: number;
}

/** Calorie + health analytics derived from the user's liked foods. */
export interface NutritionAnalysis {
  /** Average calories across liked foods (kcal). */
  avgCalories: number;
  /** Average health score across liked foods (0–100). */
  avgHealth: number;
  /** Calories of the lightest / richest liked food. */
  minCalories: number;
  maxCalories: number;
  /** Rough calories for a day built from 3 of the user's favourites. */
  estimatedDay: number;
  /** True if likes are healthier on average than the foods they skipped (null if nothing skipped). */
  healthierThanSkipped: boolean | null;
  /** Standout liked foods: best-for-you and most indulgent. */
  healthiest: Food | null;
  mostIndulgent: Food | null;
}
