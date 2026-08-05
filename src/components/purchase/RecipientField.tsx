import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { colors, radius, spacing } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useRecipientsStore } from '@/store/recipientsStore';
import { detectNetwork, isValidGhanaPhone, sanitizePhoneInput } from '@/utils/phone';
import { formatNetworkName } from '@/utils/format';
import type { NetworkCode } from '@/types';

interface Props {
  value: string;
  onChange: (raw: string) => void;
  /** Called when a chip/saved number picks a recipient with a known network. */
  onPickNetwork?: (network: NetworkCode) => void;
  onPickSaved?: (label: string, msisdn: string, network: NetworkCode | null) => void;
}

export function RecipientField({ value, onChange, onPickNetwork, onPickSaved }: Props) {
  const user = useAuthStore((s) => s.user);
  const recipients = useRecipientsStore((s) => s.recipients);

  const detected = useMemo(() => detectNetwork(value), [value]);
  const valid = value.length === 0 || isValidGhanaPhone(value);

  const handleChange = (raw: string) => {
    const clean = sanitizePhoneInput(raw);
    onChange(clean);
    const net = detectNetwork(clean);
    if (net) onPickNetwork?.(net);
  };

  const useMyNumber = () => {
    if (!user?.phone) return;
    onChange(user.phone);
    const net = detectNetwork(user.phone);
    if (net) onPickNetwork?.(net);
  };

  return (
    <View style={styles.wrap}>
      <Input
        label="Recipient number"
        placeholder="024 000 0000"
        keyboardType="phone-pad"
        value={value}
        onChangeText={handleChange}
        maxLength={17}
        left={<Text tone="secondary" weight="medium">+233</Text>}
        error={!valid ? 'Enter a valid Ghana mobile number' : undefined}
        hint={detected ? `Detected network: ${formatNetworkName(detected)}` : undefined}
        right={
          detected ? (
            <View style={styles.netTag}>
              <Text variant="caption" weight="semibold" tone="brand">
                {detected === 'TELECEL' ? 'Telecel' : detected}
              </Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {user?.phone ? (
          <Pressable onPress={useMyNumber} style={styles.chip}>
            <Icon name="user" size={14} color={colors.brand} />
            <Text variant="caption" weight="medium" tone="brand">
              Use my number
            </Text>
          </Pressable>
        ) : null}

        {recipients.slice(0, 6).map((r) => (
          <Pressable
            key={r.id}
            onPress={() => {
              onChange(r.msisdn);
              if (r.network) onPickNetwork?.(r.network);
              onPickSaved?.(r.label, r.msisdn, r.network ?? null);
            }}
            style={styles.chip}
          >
            <Icon name="phone" size={13} color={colors.textSecondary} />
            <Text variant="caption" weight="medium" tone="secondary">
              {r.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  netTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.brandSoft,
  },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
});
