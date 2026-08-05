import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, hitSlop, spacing } from '@/theme';
import { Text } from './Text';
import { Icon, IconName } from './Icon';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  left?: ReactNode;
  right?: ReactNode;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
}

export function ListRow({
  title,
  subtitle,
  icon,
  left,
  right,
  value,
  onPress,
  danger,
  showChevron = true,
}: ListRowProps) {
  const content = (
    <>
      {left ?? (icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={20} color={danger ? colors.danger : colors.textSecondary} />
        </View>
      ) : null)}
      <View style={styles.textWrap}>
        <Text variant="bodySmall" weight="medium" tone={danger ? 'danger' : 'primary'} style={{ fontSize: 15 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="tertiary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="bodySmall" tone="secondary">
          {value}
        </Text>
      ) : null}
      {right}
      {onPress && showChevron && !right ? (
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      hitSlop={hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  pressed: { opacity: 0.6 },
  iconWrap: { width: 24, alignItems: 'center' },
  textWrap: { flex: 1, gap: 2 },
  subtitle: {},
});
