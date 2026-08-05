import type { Bundle, Network, NetworkCode } from '@/types';

/**
 * DEVELOPMENT MOCK DATA — clearly fictional.
 *
 * These prices are illustrative placeholders for building and testing the UI.
 * They are NOT real current tariffs. In production (USE_MOCK_DATA=false) the
 * catalogue and pricing come exclusively from the backend / telecom provider.
 */

export const MOCK_NETWORKS: Network[] = [
  { code: 'MTN', name: 'MTN Ghana', logo: null, status: 'available' },
  { code: 'TELECEL', name: 'Telecel Ghana', logo: null, status: 'available' },
  { code: 'AT', name: 'AT Ghana', logo: null, status: 'available' },
];

function bundle(
  network: NetworkCode,
  id: string,
  name: string,
  volume: number,
  unit: 'MB' | 'GB',
  price: number,
  validity: string,
  extras: Partial<Bundle> = {},
): Bundle {
  return {
    id,
    network,
    name,
    volume,
    unit,
    price,
    currency: 'GHS',
    validity,
    category: 'data',
    available: true,
    badge: null,
    ...extras,
  };
}

export const MOCK_BUNDLES: Record<NetworkCode, Bundle[]> = {
  MTN: [
    bundle('MTN', 'mtn_500mb', '500 MB', 500, 'MB', 6, '24 hours'),
    bundle('MTN', 'mtn_1gb', '1 GB', 1, 'GB', 10, '24 hours', { badge: 'Popular' }),
    bundle('MTN', 'mtn_2gb', '2 GB', 2, 'GB', 18, '3 days'),
    bundle('MTN', 'mtn_5gb', '5 GB', 5, 'GB', 35, '7 days', { badge: 'Best value' }),
    bundle('MTN', 'mtn_10gb', '10 GB', 10, 'GB', 62, '30 days'),
  ],
  TELECEL: [
    bundle('TELECEL', 'tel_1gb', '1 GB', 1, 'GB', 9, '24 hours'),
    bundle('TELECEL', 'tel_3gb', '3 GB', 3, 'GB', 24, '7 days', { badge: 'Popular' }),
    bundle('TELECEL', 'tel_6gb', '6 GB', 6, 'GB', 40, '30 days', { badge: 'Best value' }),
    bundle('TELECEL', 'tel_12gb', '12 GB', 12, 'GB', 70, '30 days'),
  ],
  AT: [
    bundle('AT', 'at_750mb', '750 MB', 750, 'MB', 5, '24 hours'),
    bundle('AT', 'at_2gb', '2 GB', 2, 'GB', 15, '3 days', { badge: 'Popular' }),
    bundle('AT', 'at_4gb', '4 GB', 4, 'GB', 28, '7 days'),
    bundle('AT', 'at_8gb', '8 GB', 8, 'GB', 50, '30 days', { badge: 'Best value' }),
  ],
};

/** Illustrative flat processing fee used only in mock mode. */
export const MOCK_FEE_GHS = 0.5;
