import { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import { assertSecureConfig } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import { useRecipientsStore } from '@/store/recipientsStore';

/** Root providers + one-time app bootstrap (config guard, store hydration). */
export function AppProviders({ children }: { children: ReactNode }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateRecipients = useRecipientsStore((s) => s.hydrate);

  useEffect(() => {
    assertSecureConfig();
    hydrateAuth();
    hydrateRecipients();
  }, [hydrateAuth, hydrateRecipients]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
