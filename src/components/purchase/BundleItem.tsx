import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { formatMoney } from '@/utils/format';
import type { Bundle } from '@/types';

interface Props {
  bundle: Bundle;
  selected: boolean;
  onSelect: (bundle: Bundle) => void;
}

export function BundleItem({ bundle, selected, onSelect }: Props) {
  const scale = useSharedValue(1);
  const disabled = !bundle.available;

  useEffect(() => {
    scale.value = withTiming(selected ? 1 : 1, { duration: 120 });
  }, [selected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onSelect(bundle);
        }}
        style={[styles.row, selected && styles.rowSelected, disabled && styles.rowDisabled]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text variant="body" weight="semibold">
              {bundle.name}
            </Text>
            {bundle.badge ? <Badge label={bundle.badge} tone="brand" /> : null}
          </View>
          <Text variant="caption" tone="tertiary">
            Valid for {bundle.validity}
          </Text>
        </View>

        <View style={styles.right}>
          <Text variant="body" weight="semibold">
            {formatMoney(bundle.price)}
          </Text>
          <View style={[styles.check, selected && styles.checkOn]}>
            {selected ? <Icon name="check" size={13} color={colors.brandContrast} strokeWidth={3} /> : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  rowDisabled: { opacity: 0.45 },
  left: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.brand, borderColor: colors.brand },
});
