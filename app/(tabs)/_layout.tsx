import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Icon, IconName } from '@/components/ui/Icon';
import { colors, fontFamily } from '@/theme';

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon name={name} size={23} color={color} strokeWidth={focused ? 2.4 : 2} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: tabIcon('activity') }} />
      <Tabs.Screen name="recipients" options={{ title: 'Recipients', tabBarIcon: tabIcon('users') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  label: { fontFamily: fontFamily.medium, fontSize: 11, marginTop: 2 },
  item: { paddingTop: 2 },
});
