import { StyleSheet, View } from 'react-native';
import { useBundles } from '@/hooks/useCatalogue';
import { radius, spacing } from '@/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { friendlyMessage } from '@/api/errors';
import { BundleItem } from './BundleItem';
import type { Bundle, NetworkCode } from '@/types';

interface Props {
  network: NetworkCode | null;
  selectedId: string | null;
  onSelect: (bundle: Bundle) => void;
}

export function BundleList({ network, selectedId, onSelect }: Props) {
  const { data: bundles, isLoading, isError, error, refetch, isRefetching } = useBundles(network);

  if (!network) return null;

  if (isLoading) {
    return (
      <View style={styles.list}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} rounded={radius.md} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn’t load bundles"
        description={friendlyMessage(error)}
        actionLabel={isRefetching ? 'Retrying…' : 'Try again'}
        onAction={() => refetch()}
      />
    );
  }

  if (!bundles || bundles.length === 0) {
    return <EmptyState icon="file-text" title="No bundles available" description="Please check back shortly." />;
  }

  return (
    <View style={styles.list}>
      {bundles.map((bundle) => (
        <BundleItem key={bundle.id} bundle={bundle} selected={selectedId === bundle.id} onSelect={onSelect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
