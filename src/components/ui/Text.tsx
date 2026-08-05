import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, fontFamily, fontSize, lineHeight } from '@/theme';

type Variant =
  | 'display' // 32 screen hero (rare)
  | 'title' // 24 screen title
  | 'heading' // 20 section heading
  | 'subheading' // 18
  | 'body' // 16 default
  | 'bodySmall' // 14
  | 'label' // 13
  | 'caption'; // 12

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Tone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'danger' | 'success' | 'warning';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  weight?: Weight;
  tone?: Tone;
  center?: boolean;
}

const variantStyle: Record<Variant, TextStyle> = {
  display: { fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'] },
  title: { fontSize: fontSize['2xl'], lineHeight: lineHeight.xl },
  heading: { fontSize: fontSize.xl, lineHeight: lineHeight.lg },
  subheading: { fontSize: fontSize.lg, lineHeight: lineHeight.md },
  body: { fontSize: fontSize.md, lineHeight: lineHeight.md },
  bodySmall: { fontSize: fontSize.base, lineHeight: lineHeight.base },
  label: { fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  caption: { fontSize: fontSize.xs, lineHeight: lineHeight.xs },
};

const weightFamily: Record<Weight, string> = {
  regular: fontFamily.regular,
  medium: fontFamily.medium,
  semibold: fontFamily.semibold,
  bold: fontFamily.bold,
};

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  inverse: colors.textInverse,
  brand: colors.brand,
  danger: colors.danger,
  success: colors.success,
  warning: colors.warning,
};

export function Text({
  variant = 'body',
  weight = 'regular',
  tone = 'primary',
  center,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        variantStyle[variant],
        { fontFamily: weightFamily[weight], color: toneColor[tone] },
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
