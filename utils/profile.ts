import foodsData from '../data/foods.json';
import { colors } from '../theme/theme';
import {
  CuisineAffinity,
  Cuisine,
  Food,
  FoodCategory,
  MacroSlice,
  NutritionAnalysis,
  TasteProfile,
  TasteTrait,
} from '../types';

const CUISINES = foodsData.cuisines as Cuisine[];

/**
 * Taste-profile engine.
 *
 * Pure, deterministic functions that turn a list of liked foods into a
 * human-readable personality. Kept free of React so the logic is easy to read,
 * test and reason about independently of the UI.
 */

// Each trait is defined by the tags that signal it. A liked food contributes to
// a trait once if it carries ANY of the trait's tags.
const TRAIT_RULES: { key: string; label: string; emoji: string; tags: string[] }[] = [
  { key: 'protein', label: 'Protein Powered', emoji: '💪', tags: ['protein', 'lean', 'poultry', 'red-meat'] },
  { key: 'health', label: 'Health Conscious', emoji: '🥗', tags: ['healthy', 'green', 'whole-grain', 'fiber', 'salad'] },
  { key: 'comfort', label: 'Comfort Craver', emoji: '🍕', tags: ['comfort', 'indulgent', 'noodles', 'bakery'] },
  { key: 'plant', label: 'Plant Forward', emoji: '🌱', tags: ['plant-based', 'vegan', 'vegetable', 'legume'] },
  { key: 'seafood', label: 'Seafood Lover', emoji: '🐟', tags: ['fish', 'seafood', 'shellfish', 'omega-3'] },
  { key: 'morning', label: 'Morning Fuel', emoji: '🌅', tags: ['breakfast', 'fruit'] },
  { key: 'global', label: 'Global Explorer', emoji: '🌍', tags: ['japanese', 'mexican', 'italian'] },
];

// Maps the dominant trait to a punchy archetype name + description.
const ARCHETYPES: Record<string, { archetype: string; tagline: string; description: string; emoji: string }> = {
  protein: {
    archetype: 'The Powerhouse',
    tagline: 'Built different',
    description: 'You gravitate toward hearty, protein-rich plates. We will lean your recommendations into high-protein meals that keep you full and fuelled.',
    emoji: '💪',
  },
  health: {
    archetype: 'The Clean Eater',
    tagline: 'Wellness first',
    description: 'Fresh, wholesome and nutrient-dense foods win you over. Expect light, vibrant, feel-good meals tuned to your taste.',
    emoji: '🥗',
  },
  comfort: {
    archetype: 'The Comfort Seeker',
    tagline: 'Flavour over everything',
    description: 'You love rich, satisfying, soul-warming food. We will surface indulgent classics with smarter twists where it counts.',
    emoji: '🍕',
  },
  plant: {
    archetype: 'The Plant Pioneer',
    tagline: 'Green at heart',
    description: 'Plant-forward dishes light you up. Your recommendations will champion vibrant veg, legumes and meat-free wins.',
    emoji: '🌱',
  },
  seafood: {
    archetype: 'The Ocean Dweller',
    tagline: 'Fresh from the sea',
    description: 'Fish and seafood are your comfort zone. We will steer toward light, omega-rich plates with a coastal edge.',
    emoji: '🐟',
  },
  morning: {
    archetype: 'The Early Bird',
    tagline: 'Breakfast champion',
    description: 'You love bright, energising morning food. Expect smart breakfasts and all-day brunch energy in your feed.',
    emoji: '🌅',
  },
  global: {
    archetype: 'The Globe Trotter',
    tagline: 'A passport on a plate',
    description: 'Your palate travels — Italian, Japanese, Mexican and beyond. We will keep your recommendations adventurous and worldly.',
    emoji: '🌍',
  },
  balanced: {
    archetype: 'The Balanced Foodie',
    tagline: 'A bit of everything',
    description: 'You enjoy variety across the board. Your recommendations will stay diverse and well-rounded across every food group.',
    emoji: '🍽️',
  },
};

const CATEGORY_META: { category: FoodCategory; label: string; color: string }[] = [
  { category: 'protein', label: 'Protein', color: colors.green },
  { category: 'carb', label: 'Carbs', color: '#F5C84B' },
  { category: 'vegetable', label: 'Veggies', color: '#4BD0F5' },
  { category: 'other', label: 'Other', color: '#C58BFF' },
];

function countMatches(foods: Food[], tags: string[]): number {
  return foods.reduce((acc, food) => (food.tags.some((t) => tags.includes(t)) ? acc + 1 : acc), 0);
}

/** Top traits, scored 0–100 as a share of liked foods that match each trait. */
export function computeTraits(likes: Food[]): TasteTrait[] {
  if (likes.length === 0) return [];
  return TRAIT_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    emoji: rule.emoji,
    score: Math.round((countMatches(likes, rule.tags) / likes.length) * 100),
  }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

/** Share of liked foods per food category. */
export function computeMacros(likes: Food[]): MacroSlice[] {
  const total = likes.length || 1;
  return CATEGORY_META.map(({ category, label, color }) => {
    const count = likes.filter((f) => f.category === category).length;
    return { category, label, count, percent: Math.round((count / total) * 100), color };
  }).filter((m) => m.count > 0);
}

/** Best-guess favourite cuisine, inferred from liked-food tags. */
export function computeTopCuisine(likes: Food[]): CuisineAffinity | null {
  const tagToCuisine: Record<string, string> = {
    italian: 'Italian',
    mexican: 'Mexican',
    japanese: 'Japanese',
    fish: 'Japanese',
    rice: 'Japanese',
  };
  const counts = new Map<string, number>();
  likes.forEach((food) => {
    food.tags.forEach((tag) => {
      const cuisine = tagToCuisine[tag];
      if (cuisine) counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1);
    });
  });
  let best: CuisineAffinity | null = null;
  counts.forEach((count, name) => {
    if (!best || count > best.count) {
      const meta = CUISINES.find((c) => c.name === name);
      best = { name, emoji: meta?.emoji ?? '🍽️', count };
    }
  });
  return best;
}

/** All cuisines the user's likes hint at, strongest first. */
export function computeCuisines(likes: Food[]): CuisineAffinity[] {
  const tagToCuisine: Record<string, string> = {
    italian: 'Italian',
    mexican: 'Mexican',
    japanese: 'Japanese',
    fish: 'Japanese',
    rice: 'Japanese',
  };
  const counts = new Map<string, number>();
  likes.forEach((food) =>
    food.tags.forEach((tag) => {
      const cuisine = tagToCuisine[tag];
      if (cuisine) counts.set(cuisine, (counts.get(cuisine) ?? 0) + 1);
    }),
  );
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      emoji: CUISINES.find((c) => c.name === name)?.emoji ?? '🍽️',
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Full profile shown on the results screen. */
export function computeProfile(likes: Food[], dislikes: Food[]): TasteProfile {
  const traits = computeTraits(likes);
  const macros = computeMacros(likes);
  const topCuisine = computeTopCuisine(likes);

  // The dominant trait decides the archetype. With no clear winner (or a near
  // tie across many groups) we fall back to the "balanced" persona.
  const dominant = traits[0];
  const second = traits[1];
  const isBalanced =
    !dominant || (second && dominant.score - second.score <= 5 && traits.length >= 3);
  const archetypeKey = isBalanced ? 'balanced' : dominant.key;
  const meta = ARCHETYPES[archetypeKey] ?? ARCHETYPES.balanced;

  return {
    ...meta,
    traits,
    macros,
    topCuisine,
    likedCount: likes.length,
    dislikedCount: dislikes.length,
  };
}

const avg = (foods: Food[], pick: (f: Food) => number): number =>
  foods.length === 0 ? 0 : Math.round(foods.reduce((s, f) => s + pick(f), 0) / foods.length);

/**
 * Calorie + health analytics over the user's liked foods — the "give analysis"
 * layer. Pure and deterministic so it's trivial to reason about and test.
 */
export function computeNutrition(likes: Food[], dislikes: Food[]): NutritionAnalysis {
  if (likes.length === 0) {
    return {
      avgCalories: 0,
      avgHealth: 0,
      minCalories: 0,
      maxCalories: 0,
      estimatedDay: 0,
      healthierThanSkipped: null,
      healthiest: null,
      mostIndulgent: null,
    };
  }

  const avgCalories = avg(likes, (f) => f.calories);
  const avgHealth = avg(likes, (f) => f.healthScore);
  const cals = likes.map((f) => f.calories);

  // Best-for-you = highest health; most indulgent = lowest health (tie-broken by
  // the bigger calorie hit), so the two picks always contrast meaningfully.
  const healthiest = likes.reduce((a, b) => (b.healthScore > a.healthScore ? b : a));
  const mostIndulgent = likes.reduce((a, b) =>
    b.healthScore < a.healthScore || (b.healthScore === a.healthScore && b.calories > a.calories)
      ? b
      : a,
  );

  return {
    avgCalories,
    avgHealth,
    minCalories: Math.min(...cals),
    maxCalories: Math.max(...cals),
    estimatedDay: avgCalories * 3,
    healthierThanSkipped:
      dislikes.length === 0 ? null : avgHealth > avg(dislikes, (f) => f.healthScore),
    healthiest,
    mostIndulgent,
  };
}
