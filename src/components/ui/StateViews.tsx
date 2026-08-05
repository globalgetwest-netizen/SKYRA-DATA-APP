import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { Button } from './Button';

interface StateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
}

/** Shared empty / error / offline presentation. */
export function StateView({
  icon = 'file-text',
  title,
  description,
  actionLabel,
  onAction,
  tone = 'neutral',
}: StateProps) {
  const accent = tone === 'danger' ? colors.danger : colors.textTertiary;
  const bg = tone === 'danger' ? colors.dangerSoft : colors.surfaceMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <Icon name={icon} size={26} color={accent} />
      </View>
      <Text variant="subheading" weight="semibold" center style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" tone="secondary" center style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="secondary"
          fullWidth={false}
          size="md"
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

export function EmptyState(props: Omit<StateProps, 'tone'>) {
  return <StateView {...props} tone="neutral" />;
}

export function ErrorState(props: Omit<StateProps, 'tone' | 'icon'> & { icon?: IconName }) {
  return <StateView icon={props.icon ?? 'alert-circle'} tone="danger" {...props} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { marginBottom: 2 },
  description: { maxWidth: 300 },
  action: { marginTop: spacing.lg },
});
