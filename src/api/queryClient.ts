import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

export const queryKeys = {
  networks: ['networks'] as const,
  bundles: (network: string) => ['bundles', network] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  paymentStatus: (id: string) => ['payment-status', id] as const,
  profile: ['profile'] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // Never retry auth/validation errors; retry transient ones up to twice.
        if (error instanceof ApiError && !error.isRetryable) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
