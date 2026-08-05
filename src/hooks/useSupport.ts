import { useMutation } from '@tanstack/react-query';
import { api } from '@/services';
import type { SupportTicketInput } from '@/types';

export function useCreateSupportTicket() {
  return useMutation({
    mutationFn: (input: SupportTicketInput) => api.createSupportTicket(input),
  });
}
