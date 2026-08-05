import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
}

const heightForSize: Record<Size, number> = { lg: 54, md: 46, sm: 38 };

export function Button({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled,
  left,
  right,
  haptic = true,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress?.(e);
    },
    [haptic, onPress],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { height: heightForSize[size] },
        fullWidth && styles.fullWidth,
        variantContainer[variant],
        pressed && !isDisabled && variantPressed[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.textInverse : colors.brand} />
      ) : (
        <View style={styles.content}>
          {left}
          <Text
            variant={size === 'sm' ? 'label' : 'bodySmall'}
            weight="semibold"
            tone={textTone[variant]}
            style={{ fontSize: 15 }}
          >
            {title}
          </Text>
          {right}
        </View>
      )}
    </Pressable>
  );
}

const textTone = {
  primary: 'inverse',
  danger: 'inverse',
  secondary: 'primary',
  ghost: 'brand',
} as const;

const variantContainer: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.brand },
  danger: { backgroundColor: colors.danger },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
};

const variantPressed: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.brandStrong },
  danger: { opacity: 0.9 },
  secondary: { backgroundColor: colors.surfaceMuted },
  ghost: { backgroundColor: colors.surfaceMuted },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.45 },
});
