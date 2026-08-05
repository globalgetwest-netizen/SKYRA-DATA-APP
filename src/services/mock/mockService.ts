import { ApiError } from '@/api/errors';
import {
  type AuthSession,
  type Bundle,
  type CreateOrderInput,
  type InitPaymentInput,
  type Network,
  type NetworkCode,
  type Order,
  type OtpChallenge,
  type PaymentInit,
  type PaymentStatus,
  type SupportTicket,
  type SupportTicketInput,
  type TransactionStatus,
  type User,
} from '@/types';
import { formatNetworkName } from '@/utils/format';
import { generateReference } from '@/utils/ids';
import type { DataService } from '../types';
import { MOCK_BUNDLES, MOCK_FEE_GHS, MOCK_NETWORKS } from './data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface MockOrderRecord {
  order: Order;
  paymentId?: string;
  /** epoch ms when payment was initialised (drives the simulated timeline). */
  paidAt?: number;
  /** deterministic outcome so a given order always resolves the same way. */
  willFail: boolean;
}

/**
 * Fully isolated in-memory backend used ONLY in development.
 *
 * It models the real transaction state machine on a timer:
 *   PENDING_PAYMENT -> PAYMENT_PROCESSING -> PAYMENT_SUCCESS
 *   -> FULFILMENT_PROCESSING -> SUCCESS | FAILED
 *
 * Nothing here ever runs in production — env.useMockData is forced false there.
 */
export class MockDataService implements DataService {
  readonly isMock = true;

  private orders = new Map<string, MockOrderRecord>();
  private idempotency = new Map<string, string>(); // key -> orderId
  private otp = new Map<string, { phone: string; code: string; name?: string; expiresAt: number }>();
  private session: AuthSession | null = null;

  /* Catalogue ----------------------------------------------------- */

  async getNetworks(): Promise<Network[]> {
    await delay(280);
    return MOCK_NETWORKS;
  }

  async getBundles(network: NetworkCode): Promise<Bundle[]> {
    await delay(320);
    const bundles = MOCK_BUNDLES[network];
    if (!bundles) throw new ApiError('not_found', 'No bundles for this network.');
    return bundles;
  }

  /* Orders -------------------------------------------------------- */

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(360);

    // Idempotency: repeated taps with the same key return the same order.
    const existingId = this.idempotency.get(input.idempotencyKey);
    if (existingId) {
      const rec = this.orders.get(existingId);
      if (rec) return rec.order;
    }

    const bundle = MOCK_BUNDLES[input.network]?.find((b) => b.id === input.bundleId);
    if (!bundle) throw new ApiError('validation', 'That bundle is no longer available.');

    const now = new Date().toISOString();
    const id = generateReference('ord');
    const order: Order = {
      id,
      reference: generateReference('SKY'),
      status: 'PENDING_PAYMENT',
      network: input.network,
      networkName: formatNetworkName(input.network),
      recipient: input.recipient,
      bundle: { id: bundle.id, name: bundle.name, validity: bundle.validity },
      amount: bundle.price,
      fee: MOCK_FEE_GHS,
      total: Number((bundle.price + MOCK_FEE_GHS).toFixed(2)),
      currency: 'GHS',
      paymentMethod: null,
      createdAt: now,
      updatedAt: now,
      failureReason: null,
    };

    // ~1 in 6 orders simulate a fulfilment failure so failure UX is testable.
    this.orders.set(id, { order, willFail: Math.random() < 0.16 });
    this.idempotency.set(input.idempotencyKey, id);
    return order;
  }

  async getOrder(orderId: string): Promise<Order> {
    await delay(200);
    const rec = this.orders.get(orderId);
    if (!rec) throw new ApiError('not_found', 'Transaction not found.');
    this.advance(rec);
    return rec.order;
  }

  async listOrders(): Promise<Order[]> {
    await delay(260);
    return Array.from(this.orders.values())
      .map((rec) => {
        this.advance(rec);
        return rec.order;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async retryOrder(orderId: string): Promise<Order> {
    await delay(300);
    const rec = this.orders.get(orderId);
    if (!rec) throw new ApiError('not_found', 'Transaction not found.');
    // Retrying a failed fulfilment: give it a fresh, successful timeline.
    rec.willFail = false;
    rec.paidAt = Date.now();
    this.patch(rec, 'FULFILMENT_PROCESSING');
    return rec.order;
  }

  /* Payments ------------------------------------------------------ */

  async initPayment(input: InitPaymentInput): Promise<PaymentInit> {
    await delay(420);
    const rec = this.orders.get(input.orderId);
    if (!rec) throw new ApiError('not_found', 'Order not found.');

    const paymentId = generateReference('pay');
    rec.paymentId = paymentId;
    rec.paidAt = Date.now();
    rec.order.paymentMethod = input.method;
    this.patch(rec, 'PAYMENT_PROCESSING');

    return {
      paymentId,
      orderId: rec.order.id,
      provider: 'mock',
      method: input.method,
      // Mock mobile-money charge: no hosted page; the client polls status.
      authorizationUrl: null,
      reference: rec.order.reference,
      status: rec.order.status,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    await delay(240);
    const rec = Array.from(this.orders.values()).find((r) => r.paymentId === paymentId);
    if (!rec) throw new ApiError('not_found', 'Payment not found.');
    this.advance(rec);
    return { paymentId, orderId: rec.order.id, status: rec.order.status };
  }

  /* Auth ---------------------------------------------------------- */

  async requestOtp(phone: string, name?: string): Promise<OtpChallenge> {
    await delay(400);
    const challengeId = generateReference('otp');
    const code = '123456'; // fixed dev code
    this.otp.set(challengeId, { phone, code, name, expiresAt: Date.now() + 5 * 60_000 });
    return { challengeId, phone, expiresInSeconds: 300, devCode: code };
  }

  async verifyOtp(challengeId: string, code: string): Promise<AuthSession> {
    await delay(360);
    const challenge = this.otp.get(challengeId);
    if (!challenge) throw new ApiError('validation', 'This code request has expired. Please try again.');
    if (Date.now() > challenge.expiresAt) throw new ApiError('validation', 'The code has expired.');
    if (code !== challenge.code) throw new ApiError('validation', 'That code is incorrect. Please try again.');

    this.otp.delete(challengeId);
    const user: User = {
      id: generateReference('usr'),
      phone: challenge.phone,
      name: challenge.name ?? null,
      email: null,
      phoneVerified: true,
    };
    this.session = {
      accessToken: `mock.${generateReference('tok')}`,
      refreshToken: `mock.${generateReference('rft')}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user,
    };
    return this.session;
  }

  async getProfile(): Promise<User> {
    await delay(180);
    if (!this.session) throw new ApiError('unauthorized', 'Not signed in.');
    return this.session.user;
  }

  async signOut(): Promise<void> {
    await delay(120);
    this.session = null;
  }

  /* Support ------------------------------------------------------- */

  async createSupportTicket(input: SupportTicketInput): Promise<SupportTicket> {
    await delay(420);
    void input;
    return {
      id: generateReference('tkt'),
      reference: generateReference('SUP'),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
  }

  /* Simulated state machine -------------------------------------- */

  private patch(rec: MockOrderRecord, status: TransactionStatus, failureReason?: string) {
    rec.order = {
      ...rec.order,
      status,
      failureReason: failureReason ?? null,
      updatedAt: new Date().toISOString(),
    };
  }

  /** Advance an order along its timeline based on elapsed time since payment. */
  private advance(rec: MockOrderRecord) {
    if (!rec.paidAt) return;
    const elapsed = Date.now() - rec.paidAt;
    const terminal: TransactionStatus[] = ['SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'];
    if (terminal.includes(rec.order.status)) return;

    if (elapsed < 1500) {
      this.patch(rec, 'PAYMENT_PROCESSING');
    } else if (elapsed < 3000) {
      this.patch(rec, 'PAYMENT_SUCCESS');
    } else if (elapsed < 5000) {
      this.patch(rec, 'FULFILMENT_PROCESSING');
    } else if (rec.willFail) {
      this.patch(
        rec,
        'FAILED',
        'The network did not confirm delivery. Your payment is being reviewed for a refund.',
      );
    } else {
      this.patch(rec, 'SUCCESS');
    }
  }
}
