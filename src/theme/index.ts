export { colors, networkColors } from './colors';
export type { AppColors } from './colors';
export {
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
  shadow,
  hitSlop,
} from './tokens';

import { colors } from './colors';
import {
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
  shadow,
  hitSlop,
} from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
  shadow,
  hitSlop,
} as const;

export type Theme = typeof theme;
