import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services';
import { queryKeys } from '@/api/queryClient';
import { isInFlight } from '@/utils/format';
import type { CreateOrderInput, InitPaymentInput } from '@/types';

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => api.listOrders(),
  });
}

/**
 * A single order. While the order is in-flight (payment/fulfilment) we poll
 * every ~1.5s so the processing screen reflects real backend state and never
 * fabricates success.
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: queryKeys.order(orderId ?? 'none'),
    queryFn: () => api.getOrder(orderId as string),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isInFlight(status) ? 1500 : false;
    },
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.createOrder(input),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useInitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InitPaymentInput) => api.initPayment(input),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.order(vars.orderId) });
    },
  });
}

export function useRetryOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.retryOrder(orderId),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}
