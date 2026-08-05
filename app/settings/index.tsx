import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { AppHeader } from '@/components/ui/AppHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ListRow } from '@/components/ui/ListRow';
import { Divider } from '@/components/ui/Divider';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing } from '@/theme';
import { formatPhoneDisplay } from '@/utils/phone';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [txnAlerts, setTxnAlerts] = useState(true);

  return (
    <Screen scroll>
      <AppHeader title="Settings" />

      <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
        PERSONAL INFORMATION
      </Text>
      <Card padded={false} style={styles.group}>
        <View style={styles.pad}>
          <ListRow title="Name" value={user?.name ?? 'Not set'} showChevron={false} />
          <Divider inset />
          <ListRow title="Phone" value={user?.phone ? formatPhoneDisplay(user.phone) : 'Not signed in'} showChevron={false} />
          <Divider inset />
          <ListRow title="Email" value={user?.email ?? 'Not set'} showChevron={false} />
        </View>
      </Card>

      <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
        NOTIFICATIONS
      </Text>
      <Card padded={false} style={styles.group}>
        <View style={styles.pad}>
          <ListRow
            title="Push notifications"
            showChevron={false}
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ true: colors.brand, false: colors.borderStrong }}
              />
            }
          />
          <Divider inset />
          <ListRow
            title="Transaction alerts"
            showChevron={false}
            right={
              <Switch
                value={txnAlerts}
                onValueChange={setTxnAlerts}
                trackColor={{ true: colors.brand, false: colors.borderStrong }}
              />
            }
          />
        </View>
      </Card>

      <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
        SECURITY
      </Text>
      <Card padded={false} style={styles.group}>
        <View style={styles.pad}>
          <ListRow icon="lock" title="App lock" subtitle="Require device authentication" showChevron={false} right={<Switch value={false} trackColor={{ true: colors.brand, false: colors.borderStrong }} />} />
        </View>
      </Card>

      <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
        LEGAL
      </Text>
      <Card padded={false} style={styles.group}>
        <View style={styles.pad}>
          <ListRow icon="file-text" title="Terms of Service" onPress={() => {}} />
          <Divider inset />
          <ListRow icon="shield" title="Privacy Policy" onPress={() => {}} />
        </View>
      </Card>

      <Text variant="caption" tone="tertiary" center style={styles.version}>
        Skyra Data · v1.0.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  groupTitle: { marginTop: spacing['2xl'], marginBottom: spacing.sm, letterSpacing: 0.5 },
  group: {},
  pad: { paddingHorizontal: spacing.lg },
  version: { marginTop: spacing['3xl'] },
});
