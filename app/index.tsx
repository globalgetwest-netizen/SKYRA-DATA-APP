import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

/**
 * Entry gate. We do NOT force sign-in: the home purchase experience is open to
 * guests (the brief explicitly allows browsing bundles before registration).
 * We simply wait for the persisted session to hydrate, then land on Home.
 */
export default function Index() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status !== 'loading') {
      router.replace('/(tabs)/home');
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
