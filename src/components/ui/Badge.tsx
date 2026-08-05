import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneStyle: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceSunken, fg: colors.textSecondary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.infoSoft, fg: colors.info },
  brand: { bg: colors.brandSoft, fg: colors.brandStrong },
};

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
  dot?: boolean;
}

export function Badge({ label, tone = 'neutral', style, dot = false }: BadgeProps) {
  const t = toneStyle[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text variant="caption" weight="semibold" style={{ color: t.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
