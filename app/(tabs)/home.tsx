import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { NetworkSelector } from '@/components/purchase/NetworkSelector';
import { RecipientField } from '@/components/purchase/RecipientField';
import { BundleList } from '@/components/purchase/BundleList';
import { usePurchaseStore } from '@/store/purchaseStore';
import { spacing } from '@/theme';
import { isValidGhanaPhone, toE164Ghana } from '@/utils/phone';
import type { Bundle, NetworkCode } from '@/types';

export default function HomeScreen() {
  const store = usePurchaseStore();
  const [network, setNetwork] = useState<NetworkCode | null>(store.network);
  const [phone, setPhone] = useState<string>('');
  const [bundle, setBundle] = useState<Bundle | null>(null);

  const canReview = !!network && !!bundle && isValidGhanaPhone(phone);

  const goToReview = () => {
    const e164 = toE164Ghana(phone);
    if (!network || !bundle || !e164) return;
    store.reset();
    store.setNetwork(network);
    store.setRecipient(e164);
    store.setBundle(bundle);
    router.push('/purchase/review');
  };

  return (
    <Screen
      scroll
      footer={<Button title="Review purchase" disabled={!canReview} onPress={goToReview} />}
    >
      <View style={styles.header}>
        <Text variant="title" weight="bold">
          Skyra Data
        </Text>
        <Text variant="body" tone="secondary">
          Buy data simply.
        </Text>
      </View>

      <Text variant="heading" weight="semibold" style={styles.sectionTitle}>
        Buy mobile data
      </Text>

      <View style={styles.section}>
        <Text variant="label" weight="medium" tone="secondary" style={styles.label}>
          Choose network
        </Text>
        <NetworkSelector
          selected={network}
          onSelect={(n) => {
            setNetwork(n);
            if (bundle && bundle.network !== n) setBundle(null);
          }}
        />
      </View>

      <View style={styles.section}>
        <RecipientField
          value={phone}
          onChange={setPhone}
          onPickNetwork={(n) => {
            setNetwork(n);
            if (bundle && bundle.network !== n) setBundle(null);
          }}
        />
      </View>

      {network ? (
        <View style={styles.section}>
          <Text variant="label" weight="medium" tone="secondary" style={styles.label}>
            Select bundle
          </Text>
          <BundleList network={network} selectedId={bundle?.id ?? null} onSelect={setBundle} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.md, paddingBottom: spacing.xl, gap: 2 },
  sectionTitle: { marginBottom: spacing.lg },
  section: { marginBottom: spacing['2xl'] },
  label: { marginBottom: spacing.md },
});
