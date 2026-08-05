import type { PaymentMethod } from '@/types';
import { env } from '@/config/env';

/**
 * Client-side payment provider registry.
 *
 * IMPORTANT: The client never charges anyone. Charging, verification and
 * settlement happen entirely on the Skyra Data backend using SECRET keys that
 * live only there. This registry exists so the UI can:
 *   1. render the payment methods a provider actually supports, and
 *   2. know how to complete a charge after the backend initialises it
 *      (poll a mobile-money charge, or open a hosted checkout URL).
 *
 * Swapping providers is a backend + config change; the UI is unaffected.
 */

export type PaymentProviderId = 'paystack' | 'flutterwave' | 'mock';

export interface PaymentMethodOption {
  method: PaymentMethod;
  label: string;
  description: string;
}

export interface PaymentProviderConfig {
  id: PaymentProviderId;
  name: string;
  /** Methods this provider supports for the Ghana market. */
  methods: PaymentMethodOption[];
  /**
   * How the client finalises after backend `initPayment`:
   *  - 'poll'    : provider charges the mobile-money wallet; poll status.
   *  - 'redirect': provider returns a hosted checkout URL to open.
   */
  completion: 'poll' | 'redirect';
}

const MOBILE_MONEY: PaymentMethodOption = {
  method: 'mobile_money',
  label: 'Mobile Money',
  description: 'MTN MoMo, Telecel Cash, AT Money',
};

const CARD: PaymentMethodOption = {
  method: 'card',
  label: 'Bank card',
  description: 'Visa or Mastercard',
};

const PROVIDERS: Record<PaymentProviderId, PaymentProviderConfig> = {
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    methods: [MOBILE_MONEY, CARD],
    completion: 'redirect',
  },
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    methods: [MOBILE_MONEY, CARD],
    completion: 'redirect',
  },
  mock: {
    id: 'mock',
    name: 'Development payment',
    methods: [MOBILE_MONEY, CARD],
    completion: 'poll',
  },
};

/**
 * The active provider. In mock mode this is the local simulator; otherwise the
 * backend is the source of truth and the app renders whatever it advertises.
 * We default to Paystack's method set for UI purposes until the backend's
 * catalogue response overrides it.
 */
export function getActiveProvider(): PaymentProviderConfig {
  if (env.useMockData) return PROVIDERS.mock;
  return PROVIDERS.paystack;
}

export function getPaymentMethods(): PaymentMethodOption[] {
  return getActiveProvider().methods;
}
