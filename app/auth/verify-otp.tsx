import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useRequestOtp, useVerifyOtp } from '@/hooks/useAuth';
import { friendlyMessage } from '@/api/errors';
import { colors, radius, spacing } from '@/theme';
import { formatPhoneDisplay } from '@/utils/phone';

const CODE_LENGTH = 6;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ challengeId: string; phone: string; name?: string; devCode?: string }>();
  const [challengeId, setChallengeId] = useState(params.challengeId ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(45);
  const inputRef = useRef<TextInput>(null);

  const verify = useVerifyOtp();
  const requestOtp = useRequestOtp();

  const digits = useMemo(() => code.padEnd(CODE_LENGTH, ' ').split('').slice(0, CODE_LENGTH), [code]);
  const complete = code.length === CODE_LENGTH;

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [challengeId]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, []);

  const submit = async (value: string) => {
    setError(null);
    try {
      await verify.mutateAsync({ challengeId, code: value });
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(friendlyMessage(e));
      setCode('');
    }
  };

  const onChange = (raw: string) => {
    const next = raw.replace(/[^\d]/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    if (next.length === CODE_LENGTH) submit(next);
  };

  const resend = async () => {
    if (seconds > 0) return;
    setError(null);
    setCode('');
    try {
      const challenge = await requestOtp.mutateAsync({ phone: params.phone, name: params.name });
      setChallengeId(challenge.challengeId);
      setSeconds(45);
    } catch (e) {
      setError(friendlyMessage(e));
    }
  };

  return (
    <Screen footer={<Button title="Verify" loading={verify.isPending} disabled={!complete} onPress={() => submit(code)} />}>
      <AppHeader />
      <View style={styles.body}>
        <Text variant="title" weight="bold">
          Enter code
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          We sent a 6-digit code to {formatPhoneDisplay(params.phone ?? '')}.
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes}>
          {digits.map((d, i) => {
            const active = i === code.length;
            return (
              <View key={i} style={[styles.box, active && styles.boxActive, !!error && styles.boxError]}>
                <Text variant="heading" weight="semibold">
                  {d.trim()}
                </Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            style={styles.hiddenInput}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            caretHidden
          />
        </Pressable>

        {error ? (
          <Text variant="bodySmall" tone="danger" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.resendRow}>
          {seconds > 0 ? (
            <Text variant="bodySmall" tone="tertiary">
              Resend code in {seconds}s
            </Text>
          ) : (
            <Pressable onPress={resend} disabled={requestOtp.isPending}>
              <Text variant="bodySmall" weight="semibold" tone="brand">
                Resend code
              </Text>
            </Pressable>
          )}
        </View>

        {params.devCode ? (
          <View style={styles.devHint}>
            <Text variant="caption" tone="secondary" center>
              Development code: {params.devCode}
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  boxes: { flexDirection: 'row', gap: spacing.sm, position: 'relative' },
  box: {
    flex: 1,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.brand },
  boxError: { borderColor: colors.danger },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  error: { marginTop: spacing.md },
  resendRow: { marginTop: spacing.xl, alignItems: 'center' },
  devHint: {
    marginTop: spacing['2xl'],
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },
});
