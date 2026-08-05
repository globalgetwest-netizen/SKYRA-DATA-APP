import { create } from 'zustand';
import type { NetworkCode, SavedRecipient } from '@/types';
import { STORAGE_KEYS, storage } from '@/lib/storage';
import { generateReference } from '@/utils/ids';
import { toE164Ghana } from '@/utils/phone';

/**
 * Saved recipients (address book). Non-sensitive, so persisted via AsyncStorage.
 * A real backend can later own this list; the store's shape stays identical.
 */
interface RecipientsState {
  hydrated: boolean;
  recipients: SavedRecipient[];
  hydrate: () => Promise<void>;
  add: (label: string, msisdn: string, network?: NetworkCode | null) => Promise<SavedRecipient | null>;
  remove: (id: string) => Promise<void>;
}

async function persist(recipients: SavedRecipient[]) {
  await storage.setJSON(STORAGE_KEYS.savedRecipients, recipients);
}

export const useRecipientsStore = create<RecipientsState>((set, get) => ({
  hydrated: false,
  recipients: [],

  hydrate: async () => {
    const stored = await storage.getJSON<SavedRecipient[]>(STORAGE_KEYS.savedRecipients);
    set({ recipients: stored ?? [], hydrated: true });
  },

  add: async (label, msisdn, network = null) => {
    const e164 = toE164Ghana(msisdn);
    if (!e164) return null;
    // De-dupe on number.
    const existing = get().recipients.find((r) => r.msisdn === e164);
    if (existing) return existing;

    const recipient: SavedRecipient = {
      id: generateReference('rcp'),
      label: label.trim() || 'Saved number',
      msisdn: e164,
      network,
    };
    const next = [recipient, ...get().recipients];
    set({ recipients: next });
    await persist(next);
    return recipient;
  },

  remove: async (id) => {
    const next = get().recipients.filter((r) => r.id !== id);
    set({ recipients: next });
    await persist(next);
  },
}));
