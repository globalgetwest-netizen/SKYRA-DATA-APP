import { useQuery } from '@tanstack/react-query';
import { api } from '@/services';
import { queryKeys } from '@/api/queryClient';
import type { NetworkCode } from '@/types';

export function useNetworks() {
  return useQuery({
    queryKey: queryKeys.networks,
    queryFn: () => api.getNetworks(),
  });
}

export function useBundles(network: NetworkCode | null) {
  return useQuery({
    queryKey: queryKeys.bundles(network ?? 'none'),
    queryFn: () => api.getBundles(network as NetworkCode),
    enabled: !!network,
  });
}
