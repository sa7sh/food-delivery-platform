import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { socketService } from "../services/socketService.js";
import { clearCache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// GET RESTAURANT ORDERS
router.get("/", protect, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { restaurantId: req.user._id, isDeletedByRestaurant: { $ne: true } };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE ORDER STATUS
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ _id: req.params.id, restaurantId: req.user._id });

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    if (order.customerId) {
      socketService.notifyCustomerStatusUpdate(order.customerId, { orderId: order._id, status });
    }
    socketService.notifyRestaurantOrderUpdated(req.user._id, order);

    if (status === 'ready') socketService.notifyDeliveryPartnersReady(order);
    if (['ready', 'accepted', 'cancelled'].includes(status)) await clearCache('/api/orders/delivery/available');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SOFT DELETE ORDER
router.delete("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, restaurantId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDeletedByRestaurant = true;
    await order.save();
    res.json({ message: "Order hidden from dashboard" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
