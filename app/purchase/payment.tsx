import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ErrorState } from '@/components/ui/StateViews';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useInitPayment, useOrder } from '@/hooks/useOrders';
import { getActiveProvider } from '@/services/payment/providers';
import { friendlyMessage } from '@/api/errors';
import { colors, radius, spacing } from '@/theme';
import { formatMoney } from '@/utils/format';
import type { PaymentMethod } from '@/types';

export default function PaymentScreen() {
  const { orderId, idempotencyKey, setPayment, setPaymentMethod } = usePurchaseStore();
  const { data: order } = useOrder(orderId);
  const provider = getActiveProvider();
  const initPayment = useInitPayment();

  const [method, setMethod] = useState<PaymentMethod>(provider.methods[0]?.method ?? 'mobile_money');
  const [error, setError] = useState<string | null>(null);

  if (!orderId) {
    return (
      <Screen>
        <AppHeader title="Payment" />
        <ErrorState
          title="No active order"
          description="Please start your purchase again."
          actionLabel="Go home"
          onAction={() => router.replace('/(tabs)/home')}
        />
      </Screen>
    );
  }

  const onPay = async () => {
    if (initPayment.isPending) return; // guard against double taps
    setError(null);
    setPaymentMethod(method);
    try {
      const payment = await initPayment.mutateAsync({ orderId, method, idempotencyKey });
      setPayment(payment.paymentId);
      // For redirect providers a hosted checkout URL would be opened here.
      // The mock/mobile-money path is confirmed by polling on the next screen.
      router.replace('/purchase/processing');
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          title={order ? `Pay ${formatMoney(order.total)}` : 'Pay'}
          loading={initPayment.isPending}
          onPress={onPay}
        />
      }
    >
      <AppHeader title="Payment" step={{ current: 2, total: 3 }} />

      <View style={styles.body}>
        <Text variant="label" weight="medium" tone="secondary" style={styles.label}>
          Choose a payment method
        </Text>

        <View style={styles.methods}>
          {provider.methods.map((option) => {
            const active = method === option.method;
            return (
              <Pressable
                key={option.method}
                onPress={() => setMethod(option.method)}
                style={[styles.method, active && styles.methodActive]}
              >
                <View style={styles.methodIcon}>
                  <Icon
                    name={option.method === 'card' ? 'credit-card' : 'phone'}
                    size={20}
                    color={active ? colors.brand : colors.textSecondary}
                  />
                </View>
                <View style={styles.methodText}>
                  <Text variant="bodySmall" weight="semibold" style={{ fontSize: 15 }}>
                    {option.label}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {option.description}
                  </Text>
                </View>
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {order ? (
          <Card muted padded style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text variant="bodySmall" tone="secondary">
                Total to pay
              </Text>
              <Text variant="subheading" weight="bold">
                {formatMoney(order.total)}
              </Text>
            </View>
          </Card>
        ) : null}

        {error ? (
          <Text variant="bodySmall" tone="danger" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.secure}>
          <Icon name="lock" size={14} color={colors.textTertiary} />
          <Text variant="caption" tone="tertiary">
            Payments are processed securely by {provider.name}. Skyra Data never stores your payment details.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.md },
  label: { marginBottom: spacing.md },
  methods: { gap: spacing.sm },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: { flex: 1, gap: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand },
  radioDot: { width: 11, height: 11, borderRadius: radius.pill, backgroundColor: colors.brand },
  totalCard: { marginTop: spacing.xl },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { marginTop: spacing.lg },
  secure: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignItems: 'flex-start' },
});
