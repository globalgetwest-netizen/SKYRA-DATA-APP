import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { Divider } from '@/components/ui/Divider';
import { useOrders } from '@/hooks/useOrders';
import { friendlyMessage } from '@/api/errors';
import { colors, radius, spacing } from '@/theme';
import { relativeDayLabel } from '@/utils/format';
import type { Order, TransactionStatus } from '@/types';

type Filter = 'all' | 'successful' | 'pending' | 'failed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'successful', label: 'Successful' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

function matchesFilter(status: TransactionStatus, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'successful') return status === 'SUCCESS';
  if (filter === 'failed') return status === 'FAILED' || status === 'CANCELLED';
  return status !== 'SUCCESS' && status !== 'FAILED' && status !== 'CANCELLED';
}

export default function ActivityScreen() {
  const { data: orders, isLoading, isError, error, refetch, isRefetching } = useOrders();
  const [filter, setFilter] = useState<Filter>('all');

  const grouped = useMemo(() => {
    const filtered = (orders ?? []).filter((o) => matchesFilter(o.status, filter));
    const map = new Map<string, Order[]>();
    for (const order of filtered) {
      const key = relativeDayLabel(order.createdAt);
      const list = map.get(key) ?? [];
      list.push(order);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [orders, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text variant="title" weight="bold">
          Activity
        </Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.filter, active && styles.filterActive]}>
              <Text variant="label" weight={active ? 'semibold' : 'medium'} tone={active ? 'inverse' : 'secondary'}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand} />}
      >
        {isLoading ? (
          <View style={styles.skeletons}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} rounded={radius.md} />
            ))}
          </View>
        ) : isError ? (
          <ErrorState title="Couldn’t load activity" description={friendlyMessage(error)} actionLabel="Try again" onAction={refetch} />
        ) : grouped.length === 0 ? (
          <EmptyState
            icon="activity"
            title={filter === 'all' ? 'No transactions yet' : 'Nothing here'}
            description={filter === 'all' ? 'Your data purchases will appear here.' : 'No transactions match this filter.'}
            actionLabel={filter === 'all' ? 'Buy data' : undefined}
            onAction={filter === 'all' ? () => router.push('/(tabs)/home') : undefined}
          />
        ) : (
          grouped.map(([day, list]) => (
            <View key={day} style={styles.group}>
              <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupLabel}>
                {day}
              </Text>
              <View style={styles.card}>
                {list.map((order, idx) => (
                  <View key={order.id}>
                    <TransactionRow order={order} onPress={() => router.push(`/transactions/${order.id}`)} />
                    {idx < list.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  filter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'], flexGrow: 1 },
  skeletons: { gap: spacing.sm, paddingTop: spacing.sm },
  group: { marginBottom: spacing.xl },
  groupLabel: { marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
});
