import { colors } from '../theme/theme';

/**
 * Maps a 0–100 health score to a short, human label and a colour, so "how good
 * a food is for you" reads at a glance. Kept pure and React-free, alongside the
 * taste-profile engine, so the thresholds live in one obvious place.
 */
export interface HealthRating {
  label: string;
  color: string;
}

export function healthRating(score: number): HealthRating {
  if (score >= 85) return { label: 'Excellent', color: colors.greenBright };
  if (score >= 70) return { label: 'Healthy', color: colors.green };
  if (score >= 50) return { label: 'Moderate', color: colors.amber };
  return { label: 'Indulgent', color: colors.dislike };
}
