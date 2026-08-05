import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
  label: string;
  value?: string;
  loading?: boolean;
  emphasize?: boolean;
}

export function SummaryRow({ label, value, loading, emphasize }: Props) {
  return (
    <View style={styles.row}>
      <Text variant="bodySmall" tone={emphasize ? 'primary' : 'secondary'} weight={emphasize ? 'semibold' : 'regular'}>
        {label}
      </Text>
      {loading ? (
        <Skeleton width={80} height={16} />
      ) : (
        <Text variant="bodySmall" weight={emphasize ? 'bold' : 'medium'}>
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
