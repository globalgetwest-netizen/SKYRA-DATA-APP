/**
 * Skyra Data color tokens.
 *
 * A primarily white interface with a single confident brand accent.
 * No neon, no gradients-by-default. Semantic tokens map to raw palette
 * values so screens never reference hex codes directly.
 */

const palette = {
  white: '#FFFFFF',
  black: '#0B0F0E',

  // Brand — a trustworthy teal-green
  brand50: '#E6F4F1',
  brand100: '#C2E5DE',
  brand500: '#0A8474',
  brand600: '#087063',
  brand700: '#065F54',

  // Neutrals (warm-cool gray scale)
  gray50: '#F7F8F8',
  gray100: '#EFF1F1',
  gray200: '#E3E6E6',
  gray300: '#D2D6D6',
  gray400: '#A7AEAD',
  gray500: '#7C8483',
  gray600: '#585F5E',
  gray700: '#3C4241',
  gray800: '#252927',
  gray900: '#141716',

  // Status
  green500: '#1B9E5A',
  green50: '#E7F6EE',
  amber500: '#C2870B',
  amber50: '#FBF2DC',
  red500: '#D24A43',
  red50: '#FBEAE9',
  blue500: '#2F6FED',
  blue50: '#E8F0FE',
} as const;

export const colors = {
  palette,

  // Semantic
  background: palette.white,
  surface: palette.white,
  surfaceMuted: palette.gray50,
  surfaceSunken: palette.gray100,

  border: palette.gray200,
  borderStrong: palette.gray300,

  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textInverse: palette.white,

  brand: palette.brand500,
  brandStrong: palette.brand600,
  brandSoft: palette.brand50,
  brandContrast: palette.white,

  // Status semantic
  success: palette.green500,
  successSoft: palette.green50,
  warning: palette.amber500,
  warningSoft: palette.amber50,
  danger: palette.red500,
  dangerSoft: palette.red50,
  info: palette.blue500,
  infoSoft: palette.blue50,

  overlay: 'rgba(11, 15, 14, 0.45)',
} as const;

/** Brand colors for the three supported Ghana networks (for chips/badges only). */
export const networkColors: Record<string, { fg: string; bg: string }> = {
  MTN: { fg: '#8A6D00', bg: '#FFF4CC' },
  TELECEL: { fg: '#B3261E', bg: '#FBE3E1' },
  AT: { fg: '#0A5F9E', bg: '#E1EEFB' },
};

export type AppColors = typeof colors;
