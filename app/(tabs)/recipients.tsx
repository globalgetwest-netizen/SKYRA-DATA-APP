import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/StateViews';
import { NetworkMark } from '@/components/NetworkMark';
import { useRecipientsStore } from '@/store/recipientsStore';
import { colors, hitSlop, radius, spacing } from '@/theme';
import { formatPhoneDisplay } from '@/utils/phone';

export default function RecipientsScreen() {
  const recipients = useRecipientsStore((s) => s.recipients);
  const remove = useRecipientsStore((s) => s.remove);

  const confirmRemove = (id: string, label: string) => {
    Alert.alert('Remove number', `Remove “${label}” from your saved numbers?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text variant="title" weight="bold">
          Recipients
        </Text>
        <Pressable onPress={() => router.push('/modal-add-recipient')} hitSlop={hitSlop} style={styles.addBtn}>
          <Icon name="plus" size={20} color={colors.brand} />
          <Text variant="label" weight="semibold" tone="brand">
            Add
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {recipients.length === 0 ? (
          <EmptyState
            icon="users"
            title="No saved numbers"
            description="Save the numbers you top up often for faster checkout."
            actionLabel="Add a number"
            onAction={() => router.push('/modal-add-recipient')}
          />
        ) : (
          <View style={styles.card}>
            {recipients.map((r, idx) => (
              <View key={r.id}>
                <View style={styles.row}>
                  {r.network ? (
                    <NetworkMark network={r.network} size={40} />
                  ) : (
                    <View style={styles.placeholder}>
                      <Icon name="phone" size={18} color={colors.textTertiary} />
                    </View>
                  )}
                  <View style={styles.middle}>
                    <Text variant="bodySmall" weight="semibold" style={{ fontSize: 15 }}>
                      {r.label}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {formatPhoneDisplay(r.msisdn)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => confirmRemove(r.id, r.label)}
                    hitSlop={hitSlop}
                    style={styles.iconBtn}
                    accessibilityLabel={`Remove ${r.label}`}
                  >
                    <Icon name="trash" size={18} color={colors.textTertiary} />
                  </Pressable>
                </View>
                {idx < recipients.length - 1 ? <Divider inset /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'], flexGrow: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  placeholder: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, gap: 2 },
  iconBtn: { padding: spacing.xs },
});
