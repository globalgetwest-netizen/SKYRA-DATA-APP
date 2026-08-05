import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function PurchaseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: false, // checkout steps are linear; prevent accidental swipe-back
      }}
    >
      <Stack.Screen name="review" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="processing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="success" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
