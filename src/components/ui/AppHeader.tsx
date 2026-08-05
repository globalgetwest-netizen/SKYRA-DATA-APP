import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, hitSlop, spacing } from '@/theme';
import { Text } from './Text';
import { Icon } from './Icon';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  step?: { current: number; total: number };
}

/** Lightweight in-screen header used by the purchase flow and detail screens. */
export function AppHeader({ title, subtitle, onBack, showBack = true, right, step }: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={hitSlop} style={styles.back} accessibilityLabel="Go back">
            <Icon name="arrow-left" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.center}>
          {title ? (
            <Text variant="subheading" weight="semibold" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
      {subtitle ? (
        <Text variant="caption" tone="tertiary" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
      {step ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step.current / step.total) * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  back: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 40, alignItems: 'flex-end', justifyContent: 'center' },
  subtitle: { textAlign: 'center', marginTop: 2 },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.surfaceSunken,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: colors.brand },
});
