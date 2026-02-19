/**
 * @treato/shared — Socket Event Name Constants
 *
 * Eliminates magic strings scattered across server.js and all three apps.
 * A typo in an event name causes a silent real-time bug — use these everywhere.
 */
export const SOCKET_EVENTS = {
  // ─── Backend → Restaurant ─────────────────────────────────────────────────
  /** Emitted when a customer places a new order */
  NEW_ORDER: 'newOrder',
  /** Emitted when a delivery partner accepts an order */
  ORDER_DELIVERY_ACCEPTED: 'orderDeliveryAccepted',
  /** Emitted on any delivery partner status update (reached, picked up) */
  ORDER_UPDATED: 'orderUpdated',

  // ─── Backend → Customer ───────────────────────────────────────────────────
  /** Emitted on every order status change */
  ORDER_STATUS_UPDATED: 'orderStatusUpdated',

  // ─── Backend → Delivery Partners ──────────────────────────────────────────
  /** Emitted when a restaurant marks an order ready for pickup */
  NEW_ORDER_READY: 'newOrderReady',

  // ─── Client → Backend (room joins) ────────────────────────────────────────
  JOIN_RESTAURANT_ROOM: 'joinRestaurantRoom',
  JOIN_CUSTOMER_ROOM: 'joinCustomerRoom',
  JOIN_DELIVERY_ROOM: 'joinDeliveryRoom',
};
