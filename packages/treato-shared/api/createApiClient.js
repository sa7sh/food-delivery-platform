/**
 * @treato/shared — API Client Factory
 *
 * Creates a typed fetch wrapper that handles:
 *  - Base URL injection
 *  - Auth token injection (lazy — reads token at call time, not creation time)
 *  - JSON serialization / deserialization
 *  - Error normalization (throws Error with server message on non-2xx)
 *
 * @param {() => string} getBaseUrl  - Function that returns the current base URL
 * @param {() => string|null} getToken - Function that returns the current auth token (or null)
 * @returns {ApiClient}
 *
 * @example
 * // Customer App — src/services/api/client.js
 * import { createApiClient } from '@treato/shared/api/createApiClient';
 * import { API_BASE_URL } from '../../config';
 * import { useAuthStore } from '../../store/authStore';
 *
 * export const apiClient = createApiClient(
 *   () => API_BASE_URL,
 *   () => useAuthStore.getState().token
 * );
 *
 * // Usage:
 * const orders = await apiClient('/api/orders/my-orders');
 * const order  = await apiClient('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
 */
export function createApiClient(getBaseUrl, getToken) {
  /**
   * @param {string} path - API path (e.g. '/api/orders/my-orders')
   * @param {RequestInit} [options] - Standard fetch options
   * @returns {Promise<any>} Parsed JSON response
   * @throws {Error} With server error message on non-2xx responses
   */
  return async function request(path, options = {}) {
    const token = getToken ? getToken() : null;

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...options,
      headers,
    });

    // Handle empty responses (e.g. 204 No Content)
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message = data?.message || `Request failed with status ${res.status}`;
      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  };
}
