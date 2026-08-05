import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useOrder, useRetryOrder } from '@/hooks/useOrders';
import { colors, radius, spacing } from '@/theme';
import { isInFlight } from '@/utils/format';
import type { TransactionStatus } from '@/types';

const COPY: Record<string, { title: string; body: string }> = {
  PENDING_PAYMENT: { title: 'Waiting for payment', body: 'Complete the payment prompt on your device to continue.' },
  PAYMENT_PROCESSING: { title: 'Confirming your payment', body: 'This usually takes a few seconds. Please keep the app open.' },
  PAYMENT_SUCCESS: { title: 'Payment received', body: 'We’re now delivering your data bundle.' },
  FULFILMENT_PROCESSING: { title: 'Delivering your data', body: 'Your payment was received. We’re sending your bundle now.' },
};

export default function ProcessingScreen() {
  const { orderId } = usePurchaseStore();
  const { data: order } = useOrder(orderId);
  const retry = useRetryOrder();

  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [spin]);
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  const status: TransactionStatus = order?.status ?? 'PAYMENT_PROCESSING';

  useEffect(() => {
    if (status === 'SUCCESS') {
      router.replace('/purchase/success');
    }
  }, [status]);

  const failed = status === 'FAILED' || status === 'REFUND_PENDING' || status === 'REFUNDED';

  if (!orderId) {
    router.replace('/(tabs)/home');
    return null;
  }

  if (failed) {
    return (
      <Screen
        footer={
          <View style={styles.footerGroup}>
            <Button
              title="Try again"
              loading={retry.isPending}
              onPress={() => order && retry.mutate(order.id)}
            />
            <Button title="Get help" variant="secondary" onPress={() => router.replace('/support')} />
          </View>
        }
      >
        <View style={styles.center}>
          <View style={[styles.badge, { backgroundColor: colors.dangerSoft }]}>
            <Icon name="alert-triangle" size={30} color={colors.danger} />
          </View>
          <Text variant="title" weight="bold" center style={styles.title}>
            We couldn’t complete your purchase
          </Text>
          <Text variant="body" tone="secondary" center style={styles.body}>
            {order?.failureReason ??
              'Your payment is being reviewed. We’ll update you as soon as the transaction is resolved.'}
          </Text>
          <Text variant="caption" tone="tertiary" center style={styles.ref}>
            Reference {order?.reference}
          </Text>
        </View>
      </Screen>
    );
  }

  const copy = COPY[status] ?? COPY.PAYMENT_PROCESSING;

  return (
    <Screen>
      <View style={styles.center}>
        <Animated.View style={[styles.spinner, spinnerStyle]}>
          <View style={styles.spinnerArc} />
        </Animated.View>
        <Text variant="title" weight="bold" center style={styles.title}>
          {copy.title}
        </Text>
        <Text variant="body" tone="secondary" center style={styles.body}>
          {copy.body}
        </Text>

        {isInFlight(status) ? (
          <Text variant="caption" tone="tertiary" center style={styles.ref}>
            Please don’t close the app. Reference {order?.reference ?? '—'}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  spinnerArc: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: colors.brand,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  title: { marginBottom: spacing.md },
  body: { maxWidth: 320 },
  ref: { marginTop: spacing['2xl'] },
  footerGroup: { gap: spacing.sm },
});
