import type {
  AuthSession,
  Bundle,
  CreateOrderInput,
  InitPaymentInput,
  Network,
  NetworkCode,
  Order,
  OtpChallenge,
  PaymentInit,
  PaymentStatus,
  SupportTicket,
  SupportTicketInput,
  User,
} from '@/types';

/**
 * The single contract every backend implementation must satisfy.
 *
 * The UI and TanStack Query hooks depend ONLY on this interface. The real
 * HTTP-backed service and the in-memory mock service both implement it, so
 * flipping USE_MOCK_DATA swaps the whole data layer without changing a single
 * screen. Adding a real telecom/payment provider means editing the backend and
 * (at most) the httpService mapping — never the UI.
 */
export interface DataService {
  /** Whether this implementation is the isolated mock (drives the dev banner). */
  readonly isMock: boolean;

  /* Catalogue ----------------------------------------------------- */
  getNetworks(): Promise<Network[]>;
  getBundles(network: NetworkCode): Promise<Bundle[]>;

  /* Orders & payments --------------------------------------------- */
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  listOrders(): Promise<Order[]>;
  retryOrder(orderId: string): Promise<Order>;

  initPayment(input: InitPaymentInput): Promise<PaymentInit>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;

  /* Auth ----------------------------------------------------------- */
  requestOtp(phone: string, name?: string): Promise<OtpChallenge>;
  verifyOtp(challengeId: string, code: string): Promise<AuthSession>;
  getProfile(): Promise<User>;
  signOut(): Promise<void>;

  /* Support -------------------------------------------------------- */
  createSupportTicket(input: SupportTicketInput): Promise<SupportTicket>;
}
