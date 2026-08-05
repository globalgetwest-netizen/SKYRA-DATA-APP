import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useRecipientsStore } from '@/store/recipientsStore';
import { colors, hitSlop, spacing } from '@/theme';
import { detectNetwork, isValidGhanaPhone, sanitizePhoneInput } from '@/utils/phone';

export default function AddRecipientModal() {
  const add = useRecipientsStore((s) => s.add);
  const [label, setLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const valid = label.trim().length > 0 && isValidGhanaPhone(phone);

  const onSave = async () => {
    if (!valid) return;
    setSaving(true);
    await add(label, phone, detectNetwork(phone));
    setSaving(false);
    router.back();
  };

  return (
    <Screen
      edges={['top', 'left', 'right', 'bottom']}
      footer={<Button title="Save number" loading={saving} disabled={!valid} onPress={onSave} />}
    >
      <View style={styles.header}>
        <Text variant="subheading" weight="semibold">
          Add a number
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={hitSlop}>
          <Icon name="x" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.form}>
        <Input label="Label" placeholder="e.g. Mum, Work SIM" value={label} onChangeText={setLabel} maxLength={24} />
        <Input
          label="Mobile number"
          placeholder="024 000 0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(t) => setPhone(sanitizePhoneInput(t))}
          left={<Text tone="secondary" weight="medium">+233</Text>}
          error={phone.length > 0 && !isValidGhanaPhone(phone) ? 'Enter a valid Ghana mobile number' : undefined}
          hint={detectNetwork(phone) ? `Detected: ${detectNetwork(phone)}` : 'We’ll detect the network automatically'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  form: { gap: spacing.lg },
});
