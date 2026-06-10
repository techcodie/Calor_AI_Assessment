/**
 * CalorAI design tokens — the single source of truth for the app's look.
 *
 * The Figma is the visual reference; every colour, radius and spacing value the
 * UI uses is centralised here, so matching the design exactly is a matter of
 * tuning this one file rather than hunting through components.
 */

export const colors = {
  // Background ramp — neutral near-black (Figma iOS-dark), darkest -> lifted
  bg0: '#0A0A0C',
  bg1: '#101012',
  bg2: '#1A1A1E', // card surface
  bg3: '#26262B',

  // Signature green accent (CTA, active nav, "Yes")
  green: '#34D17E',
  greenBright: '#46E08D',
  greenDeep: '#1FA866',
  greenSoft: 'rgba(52, 209, 126, 0.16)',
  greenGlow: 'rgba(52, 209, 126, 0.42)',

  // Blue accent — list "love" checks, links, super-like family
  blue: '#3B82F6',
  blueSoft: 'rgba(59, 130, 246, 0.16)',
  blueGlow: 'rgba(59, 130, 246, 0.45)',

  // Like / dislike semantics
  like: '#34D17E',
  likeGlow: 'rgba(52, 209, 126, 0.42)',
  dislike: '#FF5A5F',
  dislikeSoft: 'rgba(255, 90, 95, 0.16)',
  dislikeGlow: 'rgba(255, 90, 95, 0.45)',

  // Text (neutral white)
  text: '#FFFFFF',
  textDim: 'rgba(255, 255, 255, 0.62)',
  textFaint: 'rgba(255, 255, 255, 0.40)',

  // Glass surfaces
  glassFill: 'rgba(255, 255, 255, 0.06)',
  glassFillStrong: 'rgba(255, 255, 255, 0.10)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassBorderStrong: 'rgba(255, 255, 255, 0.16)',
  // Solid stand-in used on Android (and most surfaces) — flat dark Figma card
  glassFillAndroid: 'rgba(26, 26, 30, 0.92)',
  glassFillAndroidLight: 'rgba(38, 38, 44, 0.92)',

  // Nutrition accents (calories + health rating)
  amber: '#F5C84B',
  flame: '#FF9F45',

  // 4-way swipe verdicts (← no, → yes, ↑ super like, ↓ not sure)
  superlike: '#6C7CF7',
  superlikeGlow: 'rgba(108, 124, 247, 0.45)',
  notsure: '#9AA0A6',
  notsureSoft: 'rgba(154, 160, 166, 0.18)',

  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(0, 0, 0, 0.6)',
} as const;

/** LinearGradient colour stops, reused across screens. */
export const gradients = {
  screen: ['#161618', '#0D0D0F', '#0A0A0C'] as const,
  screenIntro: ['#1B1B20', '#0F0F12', '#0A0A0C'] as const,
  cta: ['#46E08D', '#22B870'] as const,
  ctaPressed: ['#34D17E', '#1FA866'] as const,
  cardScrim: ['transparent', 'rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.92)'] as const,
  likeStamp: ['rgba(52, 209, 126, 0.0)', 'rgba(52, 209, 126, 0.22)'] as const,
  progress: ['#22B870', '#46E08D'] as const,
};

/** 4pt spacing scale. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  pill: 999,
} as const;

export const font = {
  // System font; weights chosen to read as a modern, premium product UI.
  black: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

/** Reusable elevation presets (iOS shadow + Android elevation). */
export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  greenGlow: {
    shadowColor: colors.green,
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  dislikeGlow: {
    shadowColor: colors.dislike,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  superGlow: {
    shadowColor: colors.superlike,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

/** Spring config reused for card snap-back and stack re-flow. */
export const spring = {
  damping: 18,
  stiffness: 170,
  mass: 0.7,
} as const;
