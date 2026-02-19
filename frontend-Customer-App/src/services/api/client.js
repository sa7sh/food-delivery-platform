/**
 * Customer App — Shared API Client Instance
 *
 * Single configured instance of the shared API client for the Customer App.
 * All service files should import `apiClient` from here instead of using
 * raw `fetch` calls.
 *
 * Token is read lazily at call time (not at import time), so it always
 * reflects the current auth state even after login/logout.
 */
import { createApiClient } from '@treato/shared/api/createApiClient';
import { ENV } from '../../config/env.js';
import { useAuthStore } from '../../store/authStore.js';

export const apiClient = createApiClient(
  () => ENV.API_BASE_URL,
  () => useAuthStore.getState().token
);
