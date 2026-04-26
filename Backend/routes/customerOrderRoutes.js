import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { placeOrderSchema } from "../validators/orderValidators.js";
import { validate } from "../middleware/validate.js";
import * as orderController from "../controllers/orderController.js";
import { socketService } from "../services/socketService.js";

const router = express.Router();

// PLACE ORDER
router.post("/", protect, validate(placeOrderSchema), orderController.placeOrder);

// GET MY ORDERS
router.get("/my-orders", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ customerId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("restaurantId", "name profileImage restaurantImage")
        .populate({ path: "items.foodId", select: "image name" })
        .lean(),
      Order.countDocuments({ customerId: req.user._id })
    ]);

    res.json({ orders, pagination: { page, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ORDER DETAILS
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurantId", "name profileImage restaurantImage addresses")
      .populate("customerId", "name phone addresses")
      .populate("deliveryPartnerId", "name phone")
      .populate({ path: "items.foodId", select: "image name" })
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CANCEL ORDER
router.post("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!["pending", "placed"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel order at this stage" });
    }

    const secondsSinceCreation = (new Date() - new Date(order.createdAt)) / 1000;
    if (secondsSinceCreation > 30) {
      return res.status(400).json({ message: "Cancellation window expired" });
    }

    order.status = "cancelled";
    order.timeline.push({ status: "cancelled", description: "Cancelled by customer", timestamp: new Date() });
    await order.save();

    socketService.notifyCustomerStatusUpdate(req.user._id, { orderId: order._id, status: "cancelled" });
    socketService.notifyRestaurantOrderUpdated(order.restaurantId, order);

    res.json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
