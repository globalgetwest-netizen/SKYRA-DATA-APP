import { env } from '@/config/env';
import type { DataService } from './types';
import { HttpDataService } from './httpService';
import { MockDataService } from './mock/mockService';

/**
 * The single data-layer entry point for the whole app.
 *
 * Selection is decided once, here, by configuration:
 *   - USE_MOCK_DATA=true (dev only) -> isolated in-memory MockDataService
 *   - otherwise                     -> real HttpDataService (backend)
 *
 * Production builds force useMockData=false (see config/env.ts), so a shipped
 * app can never accidentally serve mock data. UI code imports `api` and never
 * knows or cares which implementation is behind it.
 */
export const api: DataService = env.useMockData ? new MockDataService() : new HttpDataService();

export type { DataService } from './types';

// Re-export so screens can show the dev banner without importing env directly.
export const IS_MOCK = api.isMock;
