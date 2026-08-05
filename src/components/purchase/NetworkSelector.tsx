import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNetworks } from '@/hooks/useCatalogue';
import { colors, radius, spacing } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { NetworkMark } from '@/components/NetworkMark';
import type { NetworkCode } from '@/types';

interface Props {
  selected: NetworkCode | null;
  onSelect: (network: NetworkCode) => void;
}

export function NetworkSelector({ selected, onSelect }: Props) {
  const { data: networks, isLoading, isError, refetch } = useNetworks();

  if (isLoading) {
    return (
      <View style={styles.row}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={92} rounded={radius.lg} style={styles.cell} />
        ))}
      </View>
    );
  }

  if (isError || !networks) {
    return (
      <Pressable onPress={() => refetch()} style={styles.errorBox}>
        <Text variant="bodySmall" tone="secondary" center>
          Couldn’t load networks. Tap to retry.
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      {networks.map((network) => {
        const active = selected === network.code;
        const disabled = network.status !== 'available';
        return (
          <Pressable
            key={network.code}
            disabled={disabled}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(network.code);
            }}
            style={[styles.cell, styles.card, active && styles.cardActive, disabled && styles.cardDisabled]}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
          >
            <NetworkMark network={network.code} size={40} />
            <Text variant="caption" weight={active ? 'semibold' : 'medium'} tone={active ? 'brand' : 'secondary'}>
              {network.code === 'TELECEL' ? 'Telecel' : network.code === 'AT' ? 'AT' : 'MTN'}
            </Text>
            {disabled ? (
              <Text variant="caption" tone="tertiary" style={styles.status}>
                Unavailable
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  cell: { flex: 1 },
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  cardDisabled: { opacity: 0.5 },
  status: { marginTop: -2 },
  errorBox: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
});
