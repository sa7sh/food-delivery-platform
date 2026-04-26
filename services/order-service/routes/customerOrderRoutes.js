import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { placeOrderSchema } from "../validators/orderValidators.js";
import { validate } from "../middleware/validate.js";
import * as orderController from "../controllers/orderController.js";
import { socketService } from "../socket/socketService.js";
import fs from "fs";

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
        .select("status totalAmount createdAt restaurantId items paymentMethod deliveryReviewed restaurantReviewed")
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
    const orderId = req.params.id;
    const userId = req.user._id.toString();
    
    // Log to a file we can definitely read
    try {
      const logMsg = `[${new Date().toISOString()}] Detail Request: Order ${orderId} | User ${userId}\n`;
      fs.appendFileSync("request_logs.txt", logMsg);
    } catch (e) {}

    const order = await Order.findById(orderId)
      .populate("restaurantId", "name profileImage restaurantImage addresses")
      .populate("customerId", "name phone addresses")
      .populate("deliveryPartnerId", "name phone")
      .populate({ path: "items.foodId", select: "image name" })
      .lean();

    if (!order) {
      try { fs.appendFileSync("request_logs.txt", `[${new Date().toISOString()}] Order Not Found: ${orderId}\n`); } catch (e) {}
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Safety check for customerId
    const orderCustId = order.customerId._id 
      ? order.customerId._id.toString() 
      : order.customerId.toString();
    
    try { fs.appendFileSync("request_logs.txt", `[${new Date().toISOString()}] Comparing: OrderCust ${orderCustId} | User ${userId}\n`); } catch (e) {}

    if (orderCustId !== userId) {
      try { fs.appendFileSync("request_logs.txt", `[${new Date().toISOString()}] Auth Fail: ${orderCustId} !== ${userId}\n`); } catch (e) {}
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    try { fs.appendFileSync("request_logs.txt", `[${new Date().toISOString()}] Error: ${error.message}\n`); } catch (e) {}
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
