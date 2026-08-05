import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing } from '@/theme';
import { formatPhoneDisplay } from '@/utils/phone';

export default function ProfileScreen() {
  const { status, user, signOut } = useAuthStore();
  const authed = status === 'authenticated';

  const onSignOut = () => {
    Alert.alert('Sign out', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text variant="title" weight="bold">
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {authed && user ? (
          <Card style={styles.identity}>
            <View style={styles.avatar}>
              <Text variant="heading" weight="semibold" tone="brand">
                {(user.name?.[0] ?? user.phone.slice(-2, -1)).toUpperCase()}
              </Text>
            </View>
            <View style={styles.identityText}>
              <Text variant="subheading" weight="semibold">
                {user.name ?? 'Your account'}
              </Text>
              <Text variant="bodySmall" tone="secondary">
                {formatPhoneDisplay(user.phone)}
              </Text>
            </View>
            {user.phoneVerified ? <Icon name="shield" size={20} color={colors.success} /> : null}
          </Card>
        ) : (
          <Card style={styles.signInCard}>
            <Text variant="subheading" weight="semibold">
              Sign in to Skyra Data
            </Text>
            <Text variant="bodySmall" tone="secondary" style={styles.signInBody}>
              Save recipients, keep your receipts, and track every purchase across devices.
            </Text>
            <Button title="Sign in or create account" size="md" onPress={() => router.push('/auth/login')} />
          </Card>
        )}

        <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
          ACCOUNT
        </Text>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowPad}>
            <ListRow icon="user" title="Personal information" onPress={() => router.push('/settings')} />
            <Divider inset />
            <ListRow icon="users" title="Saved numbers" onPress={() => router.push('/(tabs)/recipients')} />
            <Divider inset />
            <ListRow icon="activity" title="Transactions" onPress={() => router.push('/(tabs)/activity')} />
            <Divider inset />
            <ListRow icon="credit-card" title="Payment methods" onPress={() => router.push('/settings')} />
            <Divider inset />
            <ListRow icon="bell" title="Notifications" onPress={() => router.push('/settings')} />
            <Divider inset />
            <ListRow icon="lock" title="Security" onPress={() => router.push('/settings')} />
          </View>
        </Card>

        <Text variant="label" weight="semibold" tone="tertiary" style={styles.groupTitle}>
          SUPPORT
        </Text>
        <Card padded={false} style={styles.group}>
          <View style={styles.rowPad}>
            <ListRow icon="help-circle" title="Help & Support" onPress={() => router.push('/support')} />
            <Divider inset />
            <ListRow icon="file-text" title="Terms of Service" onPress={() => router.push('/settings')} />
            <Divider inset />
            <ListRow icon="shield" title="Privacy Policy" onPress={() => router.push('/settings')} />
          </View>
        </Card>

        {authed ? (
          <Card padded={false} style={styles.group}>
            <View style={styles.rowPad}>
              <ListRow icon="log-out" title="Sign out" danger showChevron={false} onPress={onSignOut} />
            </View>
          </Card>
        ) : null}

        <Text variant="caption" tone="tertiary" center style={styles.version}>
          Skyra Data · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { flex: 1, gap: 2 },
  signInCard: { gap: spacing.md },
  signInBody: { marginBottom: spacing.xs },
  groupTitle: { marginTop: spacing['2xl'], marginBottom: spacing.sm, letterSpacing: 0.5 },
  group: {},
  rowPad: { paddingHorizontal: spacing.lg },
  version: { marginTop: spacing['3xl'] },
});
