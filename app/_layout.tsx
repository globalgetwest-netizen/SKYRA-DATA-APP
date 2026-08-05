import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AppProviders } from '@/components/AppProviders';
import { DevModeBanner } from '@/components/DevModeBanner';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Keep the native splash up until fonts resolve so we never flash an
  // unstyled frame or hit an "unrecognised font family" during first paint.
  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DevModeBanner />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          {/* Routes are auto-discovered from the app/ directory. Only screens
              that need non-default options are declared explicitly. */}
          <Stack.Screen
            name="modal-add-recipient"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </View>
    </AppProviders>
  );
}
