import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  muted?: boolean;
}

export function Card({ children, style, padded = true, muted = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        muted && styles.muted,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  muted: { backgroundColor: colors.surfaceMuted },
  padded: { padding: spacing.lg },
});
