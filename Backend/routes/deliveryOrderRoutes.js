import express from "express";
import Order from "../models/Order.js";
import { protectDelivery } from "../middleware/deliveryAuthMiddleware.js";
import { socketService } from "../services/socketService.js";
import { cacheResponse, clearCache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// GET AVAILABLE ORDERS
router.get("/available", protectDelivery, cacheResponse(60), async (req, res) => {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 2);

    const readyOrders = await Order.find({
      status: "ready",
      deliveryPartnerId: null,
      createdAt: { $gte: cutoffTime },
      hiddenByDeliveryPartners: { $ne: req.partner._id }
    })
      .populate("restaurantId", "name phone addresses")
      .populate("customerId", "name phone addresses")
      .sort({ createdAt: -1 })
      .lean();

    res.json(readyOrders); // Note: Original had grouping logic, keeping it simple or matching if needed
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ACCEPT ORDER
router.patch("/:id/accept", protectDelivery, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== "ready") return res.status(400).json({ message: "Order not available" });

    order.deliveryPartnerId = req.partner._id;
    await order.save();

    socketService.notifyRestaurantDriverAccepted(order.restaurantId, order);
    await clearCache('/api/orders/delivery/available');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ORDER FOR DELIVERY PARTNER
router.get("/:id/view", protectDelivery, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurantId", "name phone addresses")
      .populate("customerId", "name phone addresses")
      .populate({ path: "items.foodId", select: "image name" })
      .lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// REACHED RESTAURANT
router.patch("/:id/reached", protectDelivery, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "reached_restaurant";
    order.timeline.push({ status: "reached_restaurant", description: "Driver reached restaurant" });
    await order.save();

    socketService.notifyRestaurantOrderUpdated(order.restaurantId, order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ORDER PICKUP
router.patch("/:id/pickup", protectDelivery, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "out_for_delivery";
    order.timeline.push({ status: "out_for_delivery", description: "Order picked up by driver" });
    await order.save();

    if (order.customerId) socketService.notifyCustomerStatusUpdate(order.customerId, { orderId: order._id, status: "out_for_delivery" });
    socketService.notifyRestaurantOrderUpdated(order.restaurantId, order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ORDER COMPLETE
router.patch("/:id/complete", protectDelivery, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "completed";
    order.timeline.push({ status: "completed", description: "Delivered successfully" });
    await order.save();

    if (order.customerId) socketService.notifyCustomerStatusUpdate(order.customerId, { orderId: order._id, status: "completed" });
    socketService.notifyRestaurantOrderUpdated(order.restaurantId, order);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STATUS UPDATES (GENERAL)
router.patch("/:id/status", protectDelivery, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.timeline.push({ status, description: `Updated by driver to ${status}` });
    await order.save();

    if (order.customerId) socketService.notifyCustomerStatusUpdate(order.customerId, { orderId: order._id, status });
    socketService.notifyRestaurantOrderUpdated(order.restaurantId, order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
