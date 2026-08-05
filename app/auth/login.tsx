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

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestOtp = useRequestOtp();

  const valid = isValidGhanaPhone(phone);

  const onContinue = async () => {
    const e164 = toE164Ghana(phone);
    if (!e164) return;
    setError(null);
    try {
      const challenge = await requestOtp.mutateAsync({ phone: e164 });
      router.push({
        pathname: '/auth/verify-otp',
        params: {
          challengeId: challenge.challengeId,
          phone: e164,
          devCode: challenge.devCode ?? '',
        },
      });
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  return (
    <Screen
      footer={
        <Button title="Continue" loading={requestOtp.isPending} disabled={!valid} onPress={onContinue} />
      }
    >
      <AppHeader />
      <View style={styles.body}>
        <Text variant="title" weight="bold">
          Sign in
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          Enter your mobile number and we’ll send you a verification code.
        </Text>

        <Input
          label="Mobile number"
          placeholder="024 000 0000"
          keyboardType="phone-pad"
          autoFocus
          value={phone}
          onChangeText={(t) => setPhone(sanitizePhoneInput(t))}
          left={<Text tone="secondary" weight="medium">+233</Text>}
          error={error ?? undefined}
          containerStyle={styles.input}
        />

        <Pressable onPress={() => router.replace('/auth/register')} style={styles.altLink}>
          <Text variant="bodySmall" tone="secondary">
            New to Skyra Data?{' '}
            <Text variant="bodySmall" weight="semibold" tone="brand">
              Create an account
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
  input: { marginBottom: spacing.xl },
  altLink: { paddingVertical: spacing.sm },
});
