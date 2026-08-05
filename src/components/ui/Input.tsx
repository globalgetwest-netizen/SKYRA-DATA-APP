import { forwardRef, ReactNode, useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  left?: ReactNode;
  right?: ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, left, right, containerStyle, onFocus, onBlur, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" weight="medium" tone="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        {left ? <View style={styles.affix}>{left}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textTertiary}
          selectionColor={colors.brand}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {right ? <View style={styles.affix}>{right}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="tertiary" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
  },
  focused: { borderColor: colors.brand, borderWidth: 1.5 },
  errored: { borderColor: colors.danger, borderWidth: 1.5 },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  affix: { justifyContent: 'center' },
  helper: { marginTop: spacing.xs },
});
