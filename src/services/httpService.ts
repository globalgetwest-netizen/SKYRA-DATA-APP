import { request } from '@/api/http';
import {
  AuthSessionSchema,
  BundleSchema,
  NetworkSchema,
  OrderSchema,
  OtpChallengeSchema,
  PaymentInitSchema,
  PaymentStatusSchema,
  SupportTicketSchema,
  UserSchema,
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
  type User,
} from '@/types';
import { z } from 'zod';
import type { DataService } from './types';

/**
 * Real backend implementation. Every response is validated with Zod at the
 * boundary so malformed payloads fail loudly instead of corrupting the UI.
 *
 * Endpoints mirror the documented Skyra Data backend API (see docs/API.md):
 *   GET  /networks
 *   GET  /networks/:network/bundles
 *   POST /orders
 *   GET  /orders            GET /orders/:id      POST /orders/:id/retry
 *   POST /payments/initialize
 *   GET  /payments/:id/status
 *   POST /auth/otp/request  POST /auth/otp/verify
 *   GET  /me
 *   POST /support/tickets
 */
export class HttpDataService implements DataService {
  readonly isMock = false;

  async getNetworks(): Promise<Network[]> {
    const data = await request<unknown>('/networks');
    return z.array(NetworkSchema).parse((data as any)?.networks ?? data);
  }

  async getBundles(network: NetworkCode): Promise<Bundle[]> {
    const data = await request<unknown>(`/networks/${network}/bundles`);
    return z.array(BundleSchema).parse((data as any)?.bundles ?? data);
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const data = await request<unknown>('/orders', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        network: input.network,
        bundleId: input.bundleId,
        recipient: input.recipient,
      },
    });
    return OrderSchema.parse((data as any)?.order ?? data);
  }

  async getOrder(orderId: string): Promise<Order> {
    const data = await request<unknown>(`/orders/${orderId}`);
    return OrderSchema.parse((data as any)?.order ?? data);
  }

  async listOrders(): Promise<Order[]> {
    const data = await request<unknown>('/orders');
    return z.array(OrderSchema).parse((data as any)?.orders ?? data);
  }

  async retryOrder(orderId: string): Promise<Order> {
    const data = await request<unknown>(`/orders/${orderId}/retry`, { method: 'POST' });
    return OrderSchema.parse((data as any)?.order ?? data);
  }

  async initPayment(input: InitPaymentInput): Promise<PaymentInit> {
    const data = await request<unknown>('/payments/initialize', {
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: { orderId: input.orderId, method: input.method },
    });
    return PaymentInitSchema.parse((data as any)?.payment ?? data);
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const data = await request<unknown>(`/payments/${paymentId}/status`);
    return PaymentStatusSchema.parse((data as any)?.payment ?? data);
  }

  async requestOtp(phone: string, name?: string): Promise<OtpChallenge> {
    const data = await request<unknown>('/auth/otp/request', {
      method: 'POST',
      anonymous: true,
      body: { phone, name },
    });
    return OtpChallengeSchema.parse((data as any)?.challenge ?? data);
  }

  async verifyOtp(challengeId: string, code: string): Promise<AuthSession> {
    const data = await request<unknown>('/auth/otp/verify', {
      method: 'POST',
      anonymous: true,
      body: { challengeId, code },
    });
    return AuthSessionSchema.parse((data as any)?.session ?? data);
  }

  async getProfile(): Promise<User> {
    const data = await request<unknown>('/me');
    return UserSchema.parse((data as any)?.user ?? data);
  }

  async signOut(): Promise<void> {
    await request('/auth/signout', { method: 'POST' }).catch(() => {});
  }

  async createSupportTicket(input: SupportTicketInput): Promise<SupportTicket> {
    const data = await request<unknown>('/support/tickets', {
      method: 'POST',
      body: input,
    });
    return SupportTicketSchema.parse((data as any)?.ticket ?? data);
  }
}
