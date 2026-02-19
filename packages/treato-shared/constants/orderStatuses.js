/**
 * @treato/shared — Order Status Constants
 *
 * Single source of truth for all order statuses across the platform.
 * Backend uses lowercase values (matching MongoDB enum).
 * All apps should import from here instead of defining their own.
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  REACHED_RESTAURANT: 'reached_restaurant',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Human-readable labels for each status.
 * Use in UI display, order timelines, etc.
 */
export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: 'Order Placed',
  [ORDER_STATUS.ACCEPTED]: 'Accepted by Restaurant',
  [ORDER_STATUS.PREPARING]: 'Preparing Your Food',
  [ORDER_STATUS.READY]: 'Ready for Pickup',
  [ORDER_STATUS.REACHED_RESTAURANT]: 'Rider at Restaurant',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.COMPLETED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

/**
 * Statuses that represent an active/ongoing order.
 * Used for filter tabs in OrdersListScreen.
 */
export const ONGOING_STATUSES = new Set([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.REACHED_RESTAURANT,
  ORDER_STATUS.OUT_FOR_DELIVERY,
]);

/**
 * Statuses that represent a finished order.
 */
export const FINISHED_STATUSES = new Set([
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
]);
