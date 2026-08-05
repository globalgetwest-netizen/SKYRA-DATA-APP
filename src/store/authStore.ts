import { create } from 'zustand';
import { AuthSessionSchema, type AuthSession, type User } from '@/types';
import { SECURE_KEYS, secureStore } from '@/lib/secureStore';
import { setAuthTokenProvider } from '@/api/http';
import { api } from '@/services';

interface AuthState {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  session: AuthSession | null;
  user: User | null;

  /** Load a persisted session from secure storage on cold start. */
  hydrate: () => Promise<void>;
  setSession: (session: AuthSession) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

function sessionValid(session: AuthSession | null): session is AuthSession {
  return !!session && session.expiresAt > Date.now();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  user: null,

  hydrate: async () => {
    try {
      const raw = await secureStore.get(SECURE_KEYS.session);
      if (!raw) {
        set({ status: 'unauthenticated', session: null, user: null });
        return;
      }
      const parsed = AuthSessionSchema.safeParse(JSON.parse(raw));
      if (parsed.success && sessionValid(parsed.data)) {
        set({ status: 'authenticated', session: parsed.data, user: parsed.data.user });
      } else {
        await secureStore.remove(SECURE_KEYS.session);
        set({ status: 'unauthenticated', session: null, user: null });
      }
    } catch {
      set({ status: 'unauthenticated', session: null, user: null });
    }
  },

  setSession: async (session) => {
    await secureStore.set(SECURE_KEYS.session, JSON.stringify(session));
    set({ status: 'authenticated', session, user: session.user });
  },

  refreshProfile: async () => {
    if (!sessionValid(get().session)) return;
    try {
      const user = await api.getProfile();
      set((s) => ({ user, session: s.session ? { ...s.session, user } : s.session }));
    } catch {
      // non-fatal; keep the cached user
    }
  },

  signOut: async () => {
    try {
      await api.signOut();
    } catch {
      // ignore network errors on sign out
    }
    await secureStore.remove(SECURE_KEYS.session);
    set({ status: 'unauthenticated', session: null, user: null });
  },
}));

// Bridge the token into the HTTP client so every authed request is bearer-signed.
setAuthTokenProvider(() => {
  const { session } = useAuthStore.getState();
  return sessionValid(session) ? session.accessToken : null;
});

export const selectIsAuthenticated = (s: AuthState) => s.status === 'authenticated';
