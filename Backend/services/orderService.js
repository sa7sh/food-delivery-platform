/**
 * Order Service — business logic for order operations.
 *
 * Route handlers should be thin wrappers: parse request → call service → send response.
 * All DB queries, validations, and socket emissions live here.
 *
 * Migrate handlers incrementally — old route handlers still work untouched.
 */
import Order from '../models/Order.js';
import User from '../models/User.js';
import FoodItem from '../models/FoodItem.js';
import { AppError } from '../utils/AppError.js';
import { socketService } from './socketService.js';

// ─── Place Order ─────────────────────────────────────────────────────────────

/**
 * Creates a new order and notifies the restaurant via socket.
 *
 * @param {object} params
 * @param {string} params.restaurantId
 * @param {object[]} params.items
 * @param {string} params.deliveryAddress
 * @param {object} [params.deliveryLocation]
 * @param {number} params.totalAmount
 * @param {string} [params.paymentMethod]
 * @param {object} params.customer  - { name, phone }
 * @param {string} params.customerId
 * @returns {Promise<import('../models/Order.js').default>} The created order document
 * @throws {AppError} On validation failures
 */
export async function placeOrder({
  restaurantId,
  items,
  deliveryAddress,
  deliveryLocation,
  totalAmount,
  paymentMethod = 'COD',
  customer,
  customerId,
}) {
  // 1. Verify restaurant exists and is accepting orders
  const restaurant = await User.findById(restaurantId);
  if (!restaurant) throw new AppError('Restaurant not found', 404);
  if (!['user', 'restaurant'].includes(restaurant.role)) {
    throw new AppError('Invalid restaurant account', 400);
  }
  if (!restaurant.isOpen) {
    throw new AppError('Restaurant is currently closed and not accepting orders', 400);
  }

  // 2. Server-side price validation (soft check — warns but doesn't block)
  const foodIds = items.map(i => i.foodId).filter(Boolean);
  if (foodIds.length > 0) {
    const foodItems = await FoodItem.find({ _id: { $in: foodIds } });
    let calculatedSubtotal = 0;
    for (const item of items) {
      if (item.foodId) {
        const found = foodItems.find(f => f._id.toString() === item.foodId.toString());
        if (found) calculatedSubtotal += found.price * item.quantity;
      }
    }
    // Soft check: client total includes taxes/delivery so we only warn on mismatch
    if (calculatedSubtotal > 0 && Math.abs(calculatedSubtotal - totalAmount) > 0.01) {
      console.warn(
        `[OrderService] Price mismatch — client: ${totalAmount}, server subtotal: ${calculatedSubtotal}. Proceeding (taxes/delivery fees may account for difference).`
      );
    }
  }

  // 3. Create the order document
  const newOrder = await Order.create({
    restaurantId,
    customerId,
    customer,
    deliveryAddress,
    deliveryLocation,
    items,
    totalAmount,
    paymentMethod,
    status: 'pending',
  });

  console.log(`[OrderService] Order created: ${newOrder._id}`);

  // 4. Notify restaurant in real time
  socketService.notifyRestaurantNewOrder(restaurantId, newOrder);

  return newOrder;
}
