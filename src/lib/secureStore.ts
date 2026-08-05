import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Secure, encrypted storage for sensitive values (auth tokens only).
 * On web SecureStore is unavailable, so we fall back to localStorage guarded
 * behind the same async API — native builds always use the Keychain/Keystore.
 */

const webStore = {
  async getItem(key: string) {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  },
};

const isWeb = Platform.OS === 'web';

export const secureStore = {
  async get(key: string): Promise<string | null> {
    if (isWeb) return webStore.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (isWeb) return webStore.setItem(key, value);
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async remove(key: string): Promise<void> {
    if (isWeb) return webStore.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  },
};

export const SECURE_KEYS = {
  session: 'skyra.session',
} as const;
