import { useMutation } from '@tanstack/react-query';
import { api } from '@/services';
import { useAuthStore } from '@/store/authStore';

export function useRequestOtp() {
  return useMutation({
    mutationFn: ({ phone, name }: { phone: string; name?: string }) => api.requestOtp(phone, name),
  });
}

export function useVerifyOtp() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: ({ challengeId, code }: { challengeId: string; code: string }) =>
      api.verifyOtp(challengeId, code),
    onSuccess: async (session) => {
      await setSession(session);
    },
  });
}
