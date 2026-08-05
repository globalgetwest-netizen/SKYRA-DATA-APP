import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { NetworkMark } from '@/components/NetworkMark';
import { formatMoney, statusMeta } from '@/utils/format';
import { maskPhone } from '@/utils/phone';
import type { Order } from '@/types';

export function TransactionRow({ order, onPress }: { order: Order; onPress?: () => void }) {
  const meta = statusMeta(order.status);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <NetworkMark network={order.network} size={42} />
      <View style={styles.middle}>
        <Text variant="bodySmall" weight="semibold" style={{ fontSize: 15 }}>
          {order.bundle.name} · {order.network === 'TELECEL' ? 'Telecel' : order.network}
        </Text>
        <Text variant="caption" tone="tertiary">
          {maskPhone(order.recipient)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text variant="bodySmall" weight="semibold">
          {formatMoney(order.total)}
        </Text>
        <Badge label={meta.label} tone={meta.tone} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.6, backgroundColor: colors.surfaceMuted },
  middle: { flex: 1, gap: 3 },
  right: { alignItems: 'flex-end', gap: spacing.xs },
});
