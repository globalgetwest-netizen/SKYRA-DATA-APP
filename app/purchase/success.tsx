import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Divider } from '@/components/ui/Divider';
import { SummaryRow } from '@/components/purchase/SummaryRow';
import { ErrorState } from '@/components/ui/StateViews';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useOrder } from '@/hooks/useOrders';
import { colors, radius, spacing } from '@/theme';
import { formatMoney, formatNetworkName } from '@/utils/format';
import { formatPhoneDisplay } from '@/utils/phone';

export default function SuccessScreen() {
  const { orderId, reset } = usePurchaseStore();
  const { data: order } = useOrder(orderId);
  const celebrated = useRef(false);

  useEffect(() => {
    if (order?.status === 'SUCCESS' && !celebrated.current) {
      celebrated.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [order?.status]);

  const buyAgain = () => {
    reset();
    router.replace('/(tabs)/home');
  };

  if (!order) {
    return (
      <Screen>
        <ErrorState
          title="Receipt unavailable"
          description="We couldn’t load this transaction."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)/home')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button title="Buy again" onPress={buyAgain} />
          <View style={styles.footerRow}>
            <Button
              title="View receipt"
              variant="secondary"
              onPress={() => router.replace(`/transactions/${order.id}`)}
            />
            <Button
              title="Transactions"
              variant="secondary"
              onPress={() => router.replace('/(tabs)/activity')}
            />
          </View>
        </View>
      }
    >
      <View style={styles.body}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.badge}>
          <Icon name="check" size={40} color={colors.brandContrast} strokeWidth={3} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)} style={styles.headline}>
          <Text variant="title" weight="bold" center>
            Data sent successfully
          </Text>
          <Text variant="body" tone="secondary" center style={styles.sub}>
            {order.bundle.name} · {formatNetworkName(order.network)}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220)} style={styles.amountWrap}>
          <Text variant="display" weight="bold" center>
            {formatMoney(order.total)}
          </Text>
        </Animated.View>

        <Card padded style={styles.card}>
          <SummaryRow label="Recipient" value={formatPhoneDisplay(order.recipient)} />
          <Divider />
          <SummaryRow label="Validity" value={order.bundle.validity} />
          <Divider />
          <SummaryRow label="Transaction ID" value={order.reference} />
          <Divider />
          <SummaryRow label="Status" value="Completed" emphasize />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', paddingTop: spacing['3xl'] },
  badge: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  headline: { alignItems: 'center' },
  sub: { marginTop: spacing.xs },
  amountWrap: { marginVertical: spacing.xl },
  card: { alignSelf: 'stretch', paddingVertical: spacing.xs },
  footer: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
