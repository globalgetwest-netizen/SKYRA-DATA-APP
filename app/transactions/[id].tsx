import { Share, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { NetworkMark } from '@/components/NetworkMark';
import { SummaryRow } from '@/components/purchase/SummaryRow';
import { ErrorState } from '@/components/ui/StateViews';
import { useOrder } from '@/hooks/useOrders';
import { friendlyMessage } from '@/api/errors';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime, formatMoney, formatNetworkName, statusMeta } from '@/utils/format';
import { formatPhoneDisplay } from '@/utils/phone';

const METHOD_LABEL: Record<string, string> = { mobile_money: 'Mobile Money', card: 'Bank card' };

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id ?? null);

  const share = async () => {
    if (!order) return;
    const lines = [
      'Skyra Data — Receipt',
      `Transaction: ${order.reference}`,
      `${order.bundle.name} · ${formatNetworkName(order.network)}`,
      `Recipient: ${formatPhoneDisplay(order.recipient)}`,
      `Amount: ${formatMoney(order.total)}`,
      `Status: ${statusMeta(order.status).label}`,
      `Date: ${formatDateTime(order.createdAt)}`,
    ];
    await Share.share({ message: lines.join('\n') });
  };

  const copyRef = async () => {
    if (!order) return;
    await Clipboard.setStringAsync(order.reference);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <Screen scroll>
      <AppHeader
        title="Transaction"
        right={
          order ? (
            <Icon name="share" size={20} color={colors.textPrimary} />
          ) : undefined
        }
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/activity'))}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={120} rounded={radius.lg} />
          <Skeleton height={200} rounded={radius.lg} />
        </View>
      ) : isError || !order ? (
        <ErrorState title="Couldn’t load transaction" description={friendlyMessage(error)} actionLabel="Try again" onAction={refetch} />
      ) : (
        <View style={styles.body}>
          <Card style={styles.hero}>
            <NetworkMark network={order.network} size={52} />
            <Text variant="heading" weight="semibold" style={styles.heroTitle}>
              {formatMoney(order.total)}
            </Text>
            <Badge label={statusMeta(order.status).label} tone={statusMeta(order.status).tone} />
          </Card>

          {order.status === 'FAILED' && order.failureReason ? (
            <View style={styles.failNote}>
              <Icon name="alert-circle" size={16} color={colors.danger} />
              <Text variant="caption" tone="secondary" style={styles.failText}>
                {order.failureReason}
              </Text>
            </View>
          ) : null}

          <Card padded style={styles.card}>
            <SummaryRow label="Status" value={statusMeta(order.status).label} emphasize />
            <Divider />
            <SummaryRow label="Network" value={formatNetworkName(order.network)} />
            <Divider />
            <SummaryRow label="Recipient" value={formatPhoneDisplay(order.recipient)} />
            <Divider />
            <SummaryRow label="Bundle" value={order.bundle.name} />
            <Divider />
            <SummaryRow label="Amount" value={formatMoney(order.amount)} />
            <Divider />
            <SummaryRow label="Payment fee" value={formatMoney(order.fee)} />
            <Divider />
            <SummaryRow label="Total" value={formatMoney(order.total)} emphasize />
            <Divider />
            <SummaryRow
              label="Payment method"
              value={order.paymentMethod ? METHOD_LABEL[order.paymentMethod] : '—'}
            />
            <Divider />
            <SummaryRow label="Transaction ID" value={order.reference} />
            <Divider />
            <SummaryRow label="Date" value={formatDateTime(order.createdAt)} />
          </Card>

          <View style={styles.actions}>
            <Button title="Share receipt" variant="secondary" size="md" onPress={share} left={<Icon name="share" size={16} color={colors.brand} />} />
            <Button title="Copy ID" variant="secondary" size="md" onPress={copyRef} left={<Icon name="copy" size={16} color={colors.brand} />} />
          </View>

          {order.status === 'FAILED' ? (
            <Button
              title="Report this transaction"
              variant="ghost"
              size="md"
              onPress={() => router.push({ pathname: '/support', params: { transactionId: order.reference } })}
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { gap: spacing.lg, paddingTop: spacing.lg },
  body: { paddingTop: spacing.md },
  hero: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing['2xl'] },
  heroTitle: {},
  failNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'flex-start',
  },
  failText: { flex: 1 },
  card: { marginTop: spacing.lg, paddingVertical: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
