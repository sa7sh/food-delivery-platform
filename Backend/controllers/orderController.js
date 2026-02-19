/**
 * Order Controller — thin request/response wrappers.
 *
 * Each function:
 *  1. Parses the request
 *  2. Calls the service
 *  3. Sends the response
 *
 * No business logic, no DB calls, no socket emissions here.
 * Errors bubble up to the global error handler via next().
 */
import * as orderService from '../services/orderService.js';

/**
 * POST /api/orders
 * Place a new order (Customer)
 */
export async function placeOrder(req, res, next) {
  try {
    const order = await orderService.placeOrder({
      restaurantId: req.body.restaurantId,
      items: req.body.items,
      deliveryAddress: req.body.deliveryAddress,
      deliveryLocation: req.body.deliveryLocation,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      customer: {
        name: req.user.name,
        phone: req.user.phone || '',
      },
      customerId: req.user._id,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}
