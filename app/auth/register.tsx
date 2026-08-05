import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRequestOtp } from '@/hooks/useAuth';
import { friendlyMessage } from '@/api/errors';
import { spacing } from '@/theme';
import { isValidGhanaPhone, sanitizePhoneInput, toE164Ghana } from '@/utils/phone';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestOtp = useRequestOtp();

  const valid = name.trim().length >= 2 && isValidGhanaPhone(phone);

  const onContinue = async () => {
    const e164 = toE164Ghana(phone);
    if (!e164) return;
    setError(null);
    try {
      const challenge = await requestOtp.mutateAsync({ phone: e164, name: name.trim() });
      router.push({
        pathname: '/auth/verify-otp',
        params: {
          challengeId: challenge.challengeId,
          phone: e164,
          name: name.trim(),
          devCode: challenge.devCode ?? '',
        },
      });
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  return (
    <Screen footer={<Button title="Continue" loading={requestOtp.isPending} disabled={!valid} onPress={onContinue} />}>
      <AppHeader />
      <View style={styles.body}>
        <Text variant="title" weight="bold">
          Create your account
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          It only takes a moment. We’ll verify your number with a one-time code.
        </Text>

        <Input label="Full name" placeholder="Ama Mensah" value={name} onChangeText={setName} containerStyle={styles.input} />
        <Input
          label="Mobile number"
          placeholder="024 000 0000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(t) => setPhone(sanitizePhoneInput(t))}
          left={<Text tone="secondary" weight="medium">+233</Text>}
          error={error ?? undefined}
          containerStyle={styles.input}
        />

        <Pressable onPress={() => router.replace('/auth/login')} style={styles.altLink}>
          <Text variant="bodySmall" tone="secondary">
            Already have an account?{' '}
            <Text variant="bodySmall" weight="semibold" tone="brand">
              Sign in
            </Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing['2xl'] },
  input: { marginBottom: spacing.lg },
  altLink: { paddingVertical: spacing.sm, marginTop: spacing.sm },
});
