import { create } from 'zustand';
import type { Bundle, NetworkCode, PaymentMethod } from '@/types';
import { uuid } from '@/utils/ids';

/**
 * Ephemeral state for the active purchase flow (network -> recipient ->
 * bundle -> review -> payment). Kept out of the URL so back/forward navigation
 * doesn't lose the draft.
 *
 * `idempotencyKey` is minted once per draft so tapping "Confirm and pay"
 * multiple times (or retrying after a flaky network) never creates duplicate
 * orders on the backend.
 */
interface PurchaseState {
  network: NetworkCode | null;
  recipient: string | null; // E.164
  recipientLabel: string | null; // e.g. saved-contact label
  bundle: Bundle | null;
  paymentMethod: PaymentMethod | null;
  idempotencyKey: string;

  // active order/payment ids once created
  orderId: string | null;
  paymentId: string | null;

  setNetwork: (network: NetworkCode) => void;
  setRecipient: (msisdn: string, label?: string | null) => void;
  setBundle: (bundle: Bundle) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setOrder: (orderId: string) => void;
  setPayment: (paymentId: string) => void;

  /** Begin a brand-new purchase (fresh idempotency key). */
  reset: () => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  network: null,
  recipient: null,
  recipientLabel: null,
  bundle: null,
  paymentMethod: null,
  idempotencyKey: uuid(),
  orderId: null,
  paymentId: null,

  setNetwork: (network) =>
    set((s) => ({
      network,
      // changing network invalidates a previously chosen bundle
      bundle: s.bundle && s.bundle.network === network ? s.bundle : null,
    })),
  setRecipient: (msisdn, label = null) => set({ recipient: msisdn, recipientLabel: label }),
  setBundle: (bundle) => set({ bundle }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setOrder: (orderId) => set({ orderId }),
  setPayment: (paymentId) => set({ paymentId }),

  reset: () =>
    set({
      network: null,
      recipient: null,
      recipientLabel: null,
      bundle: null,
      paymentMethod: null,
      idempotencyKey: uuid(),
      orderId: null,
      paymentId: null,
    }),
}));
