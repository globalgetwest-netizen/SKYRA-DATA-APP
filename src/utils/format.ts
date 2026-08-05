import type { NetworkCode, TransactionStatus } from '@/types';

export function formatNetworkName(code: NetworkCode): string {
  switch (code) {
    case 'MTN':
      return 'MTN Ghana';
    case 'TELECEL':
      return 'Telecel Ghana';
    case 'AT':
      return 'AT Ghana';
    default:
      return code;
  }
}

/** GHS 10.00 */
export function formatMoney(amount: number, currency = 'GHS'): string {
  const value = amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${value}`;
}

/** 30 July 2026 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** 30 July 2026, 14:32 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date}, ${time}`;
}

/** Group label for history: Today / Yesterday / 28 July 2026 */
export function relativeDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return formatDate(iso);
}

interface StatusMeta {
  label: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export function statusMeta(status: TransactionStatus): StatusMeta {
  switch (status) {
    case 'SUCCESS':
      return { label: 'Successful', tone: 'success' };
    case 'PENDING_PAYMENT':
      return { label: 'Awaiting payment', tone: 'neutral' };
    case 'PAYMENT_PROCESSING':
      return { label: 'Processing payment', tone: 'info' };
    case 'PAYMENT_SUCCESS':
      return { label: 'Payment received', tone: 'info' };
    case 'FULFILMENT_PROCESSING':
      return { label: 'Delivering data', tone: 'info' };
    case 'FAILED':
      return { label: 'Failed', tone: 'danger' };
    case 'REFUND_PENDING':
      return { label: 'Refund pending', tone: 'warning' };
    case 'REFUNDED':
      return { label: 'Refunded', tone: 'warning' };
    case 'CANCELLED':
      return { label: 'Cancelled', tone: 'neutral' };
    default:
      return { label: status, tone: 'neutral' };
  }
}

/** Whether a status is still in-flight (client should keep polling). */
export function isInFlight(status: TransactionStatus): boolean {
  return (
    status === 'PENDING_PAYMENT' ||
    status === 'PAYMENT_PROCESSING' ||
    status === 'PAYMENT_SUCCESS' ||
    status === 'FULFILMENT_PROCESSING'
  );
}

export function isTerminal(status: TransactionStatus): boolean {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'REFUNDED' || status === 'CANCELLED';
}
