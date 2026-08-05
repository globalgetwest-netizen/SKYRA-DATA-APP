import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Divider } from '@/components/ui/Divider';
import { useCreateSupportTicket } from '@/hooks/useSupport';
import { friendlyMessage } from '@/api/errors';
import { env } from '@/config/env';
import { colors, radius, spacing } from '@/theme';
import type { SupportTicket, SupportTicketInput } from '@/types';

const ISSUE_TYPES: { key: SupportTicketInput['issueType']; label: string }[] = [
  { key: 'data_not_received', label: 'Data not received' },
  { key: 'charged_twice', label: 'Charged twice' },
  { key: 'wrong_number', label: 'Sent to wrong number' },
  { key: 'payment_failed', label: 'Payment failed' },
  { key: 'other', label: 'Something else' },
];

export default function SupportScreen() {
  const params = useLocalSearchParams<{ transactionId?: string }>();
  const createTicket = useCreateSupportTicket();

  const [issueType, setIssueType] = useState<SupportTicketInput['issueType']>(
    params.transactionId ? 'data_not_received' : 'other',
  );
  const [transactionId, setTransactionId] = useState(params.transactionId ?? '');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const valid = description.trim().length >= 10;

  const submit = async () => {
    setError(null);
    try {
      const created = await createTicket.mutateAsync({
        issueType,
        transactionId: transactionId.trim() || undefined,
        description: description.trim(),
      });
      setTicket(created);
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  if (ticket) {
    return (
      <Screen footer={<Button title="Done" onPress={() => router.back()} />}>
        <AppHeader title="Support" />
        <View style={styles.doneWrap}>
          <View style={styles.doneBadge}>
            <Icon name="check" size={34} color={colors.brandContrast} strokeWidth={3} />
          </View>
          <Text variant="title" weight="bold" center>
            Request received
          </Text>
          <Text variant="body" tone="secondary" center style={styles.doneBody}>
            Thanks — our team will review your report and get back to you. Keep this reference for your records.
          </Text>
          <Card muted padded style={styles.refCard}>
            <Text variant="caption" tone="tertiary">
              Reference
            </Text>
            <Text variant="subheading" weight="semibold">
              {ticket.reference}
            </Text>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      footer={<Button title="Submit request" loading={createTicket.isPending} disabled={!valid} onPress={submit} />}
    >
      <AppHeader title="Help & Support" />

      <Card padded={false} style={styles.linksCard}>
        <View style={styles.linksPad}>
          <ListRow icon="help-circle" title="Help Centre" subtitle="Common questions and answers" onPress={() => {}} />
          <Divider inset />
          <ListRow
            icon="phone"
            title="Contact Support"
            subtitle={env.supportEmail}
            onPress={() => {}}
          />
        </View>
      </Card>

      <Text variant="heading" weight="semibold" style={styles.formTitle}>
        Report a transaction
      </Text>
      <Text variant="bodySmall" tone="secondary" style={styles.formIntro}>
        Tell us what went wrong and we’ll look into it.
      </Text>

      <Text variant="label" weight="medium" tone="secondary" style={styles.label}>
        Issue type
      </Text>
      <View style={styles.chips}>
        {ISSUE_TYPES.map((it) => {
          const active = issueType === it.key;
          return (
            <Pressable key={it.key} onPress={() => setIssueType(it.key)} style={[styles.chip, active && styles.chipActive]}>
              <Text variant="label" weight={active ? 'semibold' : 'medium'} tone={active ? 'inverse' : 'secondary'}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Transaction ID (optional)"
        placeholder="SKY-XXXXXX"
        autoCapitalize="characters"
        value={transactionId}
        onChangeText={setTransactionId}
        containerStyle={styles.input}
      />

      <Input
        label="Description"
        placeholder="Describe the issue in a few words…"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.textArea}
        error={error ?? undefined}
        hint={!error ? 'At least 10 characters' : undefined}
        containerStyle={styles.input}
      />

      <Text variant="caption" tone="tertiary" style={styles.hours}>
        Support responses are handled during business hours (GMT). We aim to reply within one business day.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  linksCard: { marginTop: spacing.md, marginBottom: spacing.xl },
  linksPad: { paddingHorizontal: spacing.lg },
  formTitle: { marginBottom: spacing.xs },
  formIntro: { marginBottom: spacing.xl },
  label: { marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  input: { marginBottom: spacing.lg },
  textArea: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md },
  hours: { marginTop: spacing.sm },
  doneWrap: { alignItems: 'center', paddingTop: spacing['4xl'] },
  doneBadge: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  doneBody: { marginTop: spacing.md, maxWidth: 320 },
  refCard: { alignSelf: 'stretch', marginTop: spacing['2xl'], gap: 2 },
});
