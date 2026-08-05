import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IS_MOCK } from '@/services';
import { colors, spacing } from '@/theme';
import { Text } from './ui/Text';

/**
 * Unmissable banner shown only when the app is serving isolated mock data.
 * Guarantees development mode is never mistaken for the real product.
 */
export function DevModeBanner() {
  const insets = useSafeAreaInsets();
  if (!IS_MOCK) return null;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 4 }]}>
      <Text variant="caption" weight="semibold" style={styles.text}>
        DEVELOPMENT MODE · Mock data — not real bundles, prices or payments
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.warning,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  text: { color: '#3A2A00', textAlign: 'center' },
});
