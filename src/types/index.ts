import { z } from 'zod';

/* ------------------------------------------------------------------ */
/* Networks                                                            */
/* ------------------------------------------------------------------ */

export const NetworkCodeSchema = z.enum(['MTN', 'TELECEL', 'AT']);
export type NetworkCode = z.infer<typeof NetworkCodeSchema>;

export const NetworkSchema = z.object({
  code: NetworkCodeSchema,
  name: z.string(),
  logo: z.string().url().nullable().optional(),
  status: z.enum(['available', 'unavailable', 'maintenance']),
});
export type Network = z.infer<typeof NetworkSchema>;

/* ------------------------------------------------------------------ */
/* Bundles                                                             */
/* ------------------------------------------------------------------ */

export const BundleSchema = z.object({
  id: z.string(),
  network: NetworkCodeSchema,
  name: z.string(),
  volume: z.number(), // numeric volume in `unit`
  unit: z.enum(['MB', 'GB']),
  price: z.number(), // major currency units (GHS)
  currency: z.literal('GHS'),
  validity: z.string(), // human readable, e.g. "24 hours", "7 days"
  category: z.enum(['data', 'social', 'night', 'unlimited']).default('data'),
  badge: z.string().nullable().optional(), // "Best value", "Popular"
  available: z.boolean(),
});
export type Bundle = z.infer<typeof BundleSchema>;

/* ------------------------------------------------------------------ */
/* Transactions / Orders                                              */
/* ------------------------------------------------------------------ */

export const TransactionStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAYMENT_PROCESSING',
  'PAYMENT_SUCCESS',
  'FULFILMENT_PROCESSING',
  'SUCCESS',
  'FAILED',
  'REFUND_PENDING',
  'REFUNDED',
  'CANCELLED',
]);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const PaymentMethodSchema = z.enum(['mobile_money', 'card']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const RecipientSchema = z.object({
  msisdn: z.string(), // E.164, e.g. +233241234567
  network: NetworkCodeSchema,
});
export type Recipient = z.infer<typeof RecipientSchema>;

export const OrderSchema = z.object({
  id: z.string(), // internal id
  reference: z.string(), // human ref, e.g. SKY-8F3K2A
  status: TransactionStatusSchema,
  network: NetworkCodeSchema,
  networkName: z.string(),
  recipient: z.string(), // E.164 msisdn the data is delivered to
  bundle: z.object({
    id: z.string(),
    name: z.string(),
    validity: z.string(),
  }),
  amount: z.number(), // bundle price
  fee: z.number(), // payment/processing fee
  total: z.number(), // amount + fee
  currency: z.literal('GHS'),
  paymentMethod: PaymentMethodSchema.nullable().optional(),
  createdAt: z.string(), // ISO
  updatedAt: z.string(), // ISO
  failureReason: z.string().nullable().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

/* ------------------------------------------------------------------ */
/* Payments                                                           */
/* ------------------------------------------------------------------ */

export const PaymentInitSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  provider: z.string(), // "paystack" | "flutterwave" | "mock"
  method: PaymentMethodSchema,
  // For hosted checkout the backend returns an authorization URL. For mobile
  // money charge flows it may instead return a status the client polls.
  authorizationUrl: z.string().url().nullable().optional(),
  reference: z.string(),
  status: TransactionStatusSchema,
});
export type PaymentInit = z.infer<typeof PaymentInitSchema>;

export const PaymentStatusSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  status: TransactionStatusSchema,
});
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

/* ------------------------------------------------------------------ */
/* Auth                                                               */
/* ------------------------------------------------------------------ */

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string(), // E.164
  name: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phoneVerified: z.boolean(),
});
export type User = z.infer<typeof UserSchema>;

export const AuthSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().nullable().optional(),
  expiresAt: z.number(), // epoch ms
  user: UserSchema,
});
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const OtpChallengeSchema = z.object({
  challengeId: z.string(),
  phone: z.string(),
  expiresInSeconds: z.number(),
  // Development-only hint so the mock flow can be tested without an SMS gateway.
  devCode: z.string().nullable().optional(),
});
export type OtpChallenge = z.infer<typeof OtpChallengeSchema>;

/* ------------------------------------------------------------------ */
/* Saved recipients (address book)                                    */
/* ------------------------------------------------------------------ */

export const SavedRecipientSchema = z.object({
  id: z.string(),
  label: z.string(), // "Mum", "My number"
  msisdn: z.string(),
  network: NetworkCodeSchema.nullable().optional(),
});
export type SavedRecipient = z.infer<typeof SavedRecipientSchema>;

/* ------------------------------------------------------------------ */
/* Support                                                            */
/* ------------------------------------------------------------------ */

export const SupportTicketInputSchema = z.object({
  transactionId: z.string().optional(),
  issueType: z.enum([
    'data_not_received',
    'charged_twice',
    'wrong_number',
    'payment_failed',
    'other',
  ]),
  description: z.string().min(10, 'Please describe the issue in a bit more detail.'),
  contact: z.string().optional(),
});
export type SupportTicketInput = z.infer<typeof SupportTicketInputSchema>;

export const SupportTicketSchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.enum(['open', 'in_review', 'resolved']),
  createdAt: z.string(),
});
export type SupportTicket = z.infer<typeof SupportTicketSchema>;

/* ------------------------------------------------------------------ */
/* Order creation input                                               */
/* ------------------------------------------------------------------ */

export interface CreateOrderInput {
  network: NetworkCode;
  bundleId: string;
  recipient: string; // E.164
  idempotencyKey: string;
}

export interface InitPaymentInput {
  orderId: string;
  method: PaymentMethod;
  idempotencyKey: string;
}
