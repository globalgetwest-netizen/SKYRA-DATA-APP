import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { NetworkMark } from '@/components/NetworkMark';
import { SummaryRow } from '@/components/purchase/SummaryRow';
import { ErrorState } from '@/components/ui/StateViews';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { friendlyMessage } from '@/api/errors';
import { colors, radius, spacing } from '@/theme';
import { formatMoney, formatNetworkName } from '@/utils/format';
import { formatPhoneDisplay } from '@/utils/phone';

export default function ReviewScreen() {
  const { network, recipient, bundle, idempotencyKey, orderId, setOrder } = usePurchaseStore();
  const createOrder = useCreateOrder();

  // Create the authoritative order once so fees/total come from the backend,
  // never invented on the client. Idempotency key prevents duplicates on
  // re-entry or double taps.
  useEffect(() => {
    if (!network || !recipient || !bundle || orderId || createOrder.isPending) return;
    createOrder
      .mutateAsync({ network, bundleId: bundle.id, recipient, idempotencyKey })
      .then((order) => setOrder(order.id))
      .catch(() => {
        /* surfaced via createOrder.isError below */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, recipient, bundle, orderId]);

  if (!network || !recipient || !bundle) {
    return (
      <Screen>
        <AppHeader title="Review" />
        <ErrorState
          title="Nothing to review"
          description="Start a new purchase from the home screen."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)/home')}
        />
      </Screen>
    );
  }

  const order = createOrder.data;
  const loadingTotals = createOrder.isPending || (!order && !createOrder.isError);

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Confirm and pay"
          loading={createOrder.isPending}
          disabled={!order || createOrder.isError}
          onPress={() => router.push('/purchase/payment')}
        />
      }
    >
      <AppHeader title="Review purchase" step={{ current: 1, total: 3 }} />

      {createOrder.isError ? (
        <ErrorState
          title="Couldn’t start your order"
          description={friendlyMessage(createOrder.error)}
          actionLabel="Try again"
          onAction={() => createOrder.reset()}
        />
      ) : (
        <View style={styles.body}>
          <View style={styles.hero}>
            <NetworkMark network={network} size={52} />
            <View style={styles.heroText}>
              <Text variant="heading" weight="semibold">
                {bundle.name}
              </Text>
              <Text variant="bodySmall" tone="secondary">
                {formatNetworkName(network)} · valid for {bundle.validity}
              </Text>
            </View>
          </View>

          <Card padded style={styles.card}>
            <SummaryRow label="Network" value={formatNetworkName(network)} />
            <Divider />
            <SummaryRow label="Recipient" value={formatPhoneDisplay(recipient)} />
            <Divider />
            <SummaryRow label="Bundle" value={bundle.name} />
            <Divider />
            <SummaryRow label="Validity" value={bundle.validity} />
          </Card>

          <Card padded style={styles.card}>
            <SummaryRow label="Price" value={order ? formatMoney(order.amount) : undefined} loading={loadingTotals} />
            <Divider />
            <SummaryRow label="Payment fee" value={order ? formatMoney(order.fee) : undefined} loading={loadingTotals} />
            <Divider />
            <SummaryRow label="Total" value={order ? formatMoney(order.total) : undefined} loading={loadingTotals} emphasize />
          </Card>

          <View style={styles.notice}>
            <Text variant="caption" tone="tertiary" center>
              Please confirm the recipient number is correct. Data bundles cannot be reversed once delivered.
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  heroText: { flex: 1, gap: 2 },
  card: { marginBottom: spacing.lg, paddingVertical: spacing.xs },
  notice: {
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
});
