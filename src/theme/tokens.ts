/** Spacing, radius, typography and shadow tokens. */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Type scale from the brief: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 32. */
export const fontSize = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  xs: 16,
  sm: 18,
  base: 20,
  md: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
} as const;

/**
 * Inter with system fallbacks. Fonts are loaded in the root layout; when the
 * custom font is unavailable RN falls back to the platform system font.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Subtle elevation only. */
export const shadow = {
  none: {},
  sm: {
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
