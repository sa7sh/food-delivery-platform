import Order from "../models/Order.js";
import { socketService } from "../socket/socketService.js";

export const placeOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      customerId: req.user._id,
      customer: {
        name: req.user.name,
        phone: req.user.phone
      }
    });

    // Notify restaurant of new order (orderCreated event)
    if (order.restaurantId) {
      socketService.notifyRestaurantNewOrder(order.restaurantId, order);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
