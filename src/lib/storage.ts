import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Non-sensitive local preferences only (saved recipients cache, last-used
 * network, onboarding flags). Never store tokens or payment data here.
 */
export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // best-effort; preferences are non-critical
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  savedRecipients: 'skyra.recipients',
  lastNetwork: 'skyra.lastNetwork',
  onboardingSeen: 'skyra.onboardingSeen',
} as const;
