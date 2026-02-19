/**
 * Socket Service — centralized socket emission functions.
 *
 * Pulls all io.to(...).emit(...) calls out of route handlers.
 * Initialize once in server.js with initSocketService(io).
 *
 * Benefits:
 *  - Event names come from SOCKET_EVENTS constants (no magic strings)
 *  - Testable in isolation (inject a mock io)
 *  - Can never accidentally duplicate an emit in a route handler
 */
import { SOCKET_EVENTS } from '../../packages/treato-shared/constants/socketEvents.js';

let _io;

/**
 * Call this once in server.js right after Socket.io is attached.
 * @param {import('socket.io').Server} io
 */
export const initSocketService = (io) => {
  _io = io;
};

const emit = (room, event, payload) => {
  if (!_io) {
    console.warn(`[SocketService] Not initialized — cannot emit '${event}' to '${room}'`);
    return;
  }
  _io.to(room).emit(event, payload);
  console.log(`[SocketService] Emitted '${event}' to '${room}'`);
};

export const socketService = {
  /** Notify restaurant of a new incoming order */
  notifyRestaurantNewOrder: (restaurantId, order) =>
    emit(`restaurant_${restaurantId}`, SOCKET_EVENTS.NEW_ORDER, order),

  /** Notify customer of any order status change */
  notifyCustomerStatusUpdate: (customerId, order) =>
    emit(`customer_${customerId}`, SOCKET_EVENTS.ORDER_STATUS_UPDATED, order),

  /** Broadcast to all online delivery partners that an order is ready for pickup */
  notifyDeliveryPartnersReady: (order) =>
    emit('delivery_partners', SOCKET_EVENTS.NEW_ORDER_READY, order),

  /** Notify restaurant that a delivery partner has accepted their order */
  notifyRestaurantDriverAccepted: (restaurantId, order) =>
    emit(`restaurant_${restaurantId}`, SOCKET_EVENTS.ORDER_DELIVERY_ACCEPTED, order),

  /** Notify restaurant of a delivery partner status update (reached, picked up) */
  notifyRestaurantOrderUpdated: (restaurantId, order) =>
    emit(`restaurant_${restaurantId}`, SOCKET_EVENTS.ORDER_UPDATED, order),
};
