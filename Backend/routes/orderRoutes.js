import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectDelivery } from "../middleware/deliveryAuthMiddleware.js";
import { DELIVERY_FEE_PER_ORDER } from "../../packages/treato-shared/constants/fees.js";
import { AppError } from "../utils/AppError.js";
import { validate } from "../middleware/validate.js";
import { placeOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators.js";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();
console.log("--> Order Routes file loaded! <--");

/**
 * =========================================================================
 * ORDER ROUTES
 * =========================================================================
 */

// DEBUG: Log all hits to order routes
router.use((req, res, next) => {
  console.log(`[OrderRoutes] Hit: ${req.method} ${req.path}`);
  next();
});

// Delete Order (Soft Delete for Restaurant) - Moved to TOP
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[OrderRoutes] DELETE endpoint hit for ID:", id);

    // Verify user is a restaurant
    // Allow 'user' role as well because sometimes restaurants are created with 'user' role but have restaurant profile
    if (!['restaurant', 'admin', 'user'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only restaurants can delete orders." });
    }

    const order = await Order.findOne({ _id: id, restaurantId: req.user._id });

    if (!order) {
      console.log("[OrderRoutes] DELETE: Order not found or unauthorized");
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // Soft Delete instead of hard delete
    order.isDeletedByRestaurant = true;
    await order.save();
    console.log("[OrderRoutes] Order soft-deleted:", id);

    res.json({ message: "Order hidden from restaurant dashboard" });
  } catch (error) {
    console.error("[OrderRoutes] DELETE Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Place Order (Customer)
// Business logic lives in orderService.placeOrder() — controller is a thin wrapper.
router.post("/", protect, validate(placeOrderSchema), orderController.placeOrder);

// Get Customer Orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch orders for the authenticated customer using customerId
    const [orders, total] = await Promise.all([
      Order.find({ customerId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("restaurantId", "name profileImage restaurantImage")
        .populate({ path: "items.foodId", select: "image name" })
        .lean(),
      Order.countDocuments({ customerId: req.user._id })
    ]);

    // Sanitize orders to remove large Base64 images
    orders.forEach(order => {
      // Sanitize Restaurant Images
      if (order.restaurantId) {
        if (order.restaurantId.restaurantImage && order.restaurantId.restaurantImage.startsWith('data:image') && order.restaurantId.restaurantImage.length > 500) {
          order.restaurantId.restaurantImage = null; // Or placeholder
        }
        if (order.restaurantId.profileImage && order.restaurantId.profileImage.startsWith('data:image') && order.restaurantId.profileImage.length > 500) {
          order.restaurantId.profileImage = null;
        }
      }

      // Sanitize Food Item Images
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (item.foodId) {
            if (item.foodId.image && item.foodId.image.startsWith('data:image') && item.foodId.image.length > 500) {
              item.foodId.image = null;
            }
          }
          // Also check item snapshot image if exists
          if (item.image && item.image.startsWith('data:image') && item.image.length > 500) {
            item.image = null;
          }
        });
      }
    });

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get Restaurant Orders (Restaurant App)
router.get("/restaurant", protect, async (req, res) => {
  try {
    console.log('[OrderRoutes] GET /restaurant hit by user:', req.user._id, 'role:', req.user.role);

    // Verify user is a restaurant
    if (!['user', 'restaurant'].includes(req.user.role)) {
      console.log('[OrderRoutes] Access denied - user role:', req.user.role);
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    // The logged-in user IS the restaurant
    const { status } = req.query;
    let query = {
      restaurantId: req.user._id,
      isDeletedByRestaurant: { $ne: true }
    };

    if (status) {
      query.status = status;
    }

    console.log('[OrderRoutes] Fetching orders with query:', JSON.stringify(query));
    const orders = await Order.find(query).sort({ createdAt: -1 });
    console.log('[OrderRoutes] Found', orders.length, 'orders');
    res.json(orders);
  } catch (error) {
    console.error('[OrderRoutes] Error fetching restaurant orders:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get Order Details
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurantId", "name profileImage restaurantImage")
      .populate("customerId", "name phone")
      .populate("deliveryPartnerId", "name phone")
      .populate({ path: "items.foodId", select: "image name" });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization check: User must be either the customer OR the restaurant
    // After populate(), customerId and restaurantId are objects, so we must use ._id
    const isCustomer = order.customerId && order.customerId._id.toString() === req.user._id.toString();
    const isRestaurant = order.restaurantId._id.toString() === req.user._id.toString();

    if (!isCustomer && !isRestaurant) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Order Status (Restaurant)
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, restaurantId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    const validStatuses = ["pending", "accepted", "preparing", "ready", "completed", "cancelled", "reached_restaurant"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.status = status;
    await order.save();

    // 🔔 REAL-TIME NOTIFICATION: Emit to Customer Room
    const io = req.app.get("socketio");
    if (io) {
      // Notify Customer
      if (order.customerId) {
        io.to(`customer_${order.customerId}`).emit("orderStatusUpdated", {
          orderId: order._id,
          status: status
        });
        console.log(`[Socket] Emitted 'orderStatusUpdated' to customer_${order.customerId}`);
      }

      // Also Notify Restaurant (in case they have multiple devices)
      io.to(`restaurant_${req.user._id}`).emit("orderUpdated", order);

      // Notify Delivery Partners if order is ready
      if (status === 'ready') {
        io.to('delivery_partners').emit('newAvailableOrder', order);
        console.log(`[Socket] Emitted 'newAvailableOrder' to delivery_partners`);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel Order (Customer)
router.post("/:id/cancel", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Find order where user is the customer (using customerId)
    const order = await Order.findOne({ _id: id, customerId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    if (!["pending", "placed"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel order in current status" });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// DELIVERY PARTNER ROUTES
// ==========================================

// Get Available Orders for Delivery (Status: Ready)
router.get("/delivery/available", protectDelivery, async (req, res) => {
  try {
    console.log("[OrderRoutes] GET /delivery/available hit");
    // Ideally should be protected, but for now open or separate auth
    const orders = await Order.find({
      status: "ready",
      deliveryPartnerId: null
    })
      .populate("restaurantId", "name phone addresses")
      .populate("customerId", "name phone addresses")
      .sort({ createdAt: -1 });

    console.log(`[OrderRoutes] Found ${orders.length} available orders for delivery`);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Earnings for Delivery Partner
router.get("/delivery/my-earnings", protectDelivery, async (req, res) => {
  try {
    const partnerId = req.partner._id;
    const DELIVERY_FEE = DELIVERY_FEE_PER_ORDER; // from @treato/shared

    const completedOrders = await Order.find({
      deliveryPartnerId: partnerId,
      status: "completed",
    })
      .populate("restaurantId", "name")
      .sort({ updatedAt: -1 });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;

    // Daily breakdown for last 7 days
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap[key] = 0;
    }

    completedOrders.forEach(order => {
      totalEarnings += DELIVERY_FEE;
      const completedAt = new Date(order.updatedAt);
      if (completedAt >= startOfToday) todayEarnings += DELIVERY_FEE;
      if (completedAt >= startOfWeek) weekEarnings += DELIVERY_FEE;
      const dayKey = completedAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (dayKey in dailyMap) dailyMap[dayKey] += DELIVERY_FEE;
    });

    const weeklyData = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

    const transactions = completedOrders.slice(0, 20).map(order => ({
      id: order._id,
      store: order.restaurantId?.name || 'Restaurant',
      time: new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: DELIVERY_FEE.toFixed(2),
    }));

    res.json({ totalEarnings, todayEarnings, weekEarnings, weeklyData, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept Order (Delivery Partner)
router.patch("/:id/delivery-accept", protectDelivery, async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryPartnerId = req.partner._id;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "ready") {
      return res.status(400).json({ message: "Order is not ready for pickup" });
    }

    order.deliveryPartnerId = deliveryPartnerId;
    // Status remains "ready" until picked up? Or "accepted_by_driver"? 
    // User said "Order Picked" step.
    // Let's keep it "ready" but assigned, or maybe "driver_assigned".
    // For now, let's keep it "ready" or maybe "driver_assigned" if we want to lock it.
    // But simplest flow: Driver accepts -> UI shows "Go to Restaurant".
    // Then Driver clicks "Picked Up" -> Status "out_for_delivery".

    // Let's just save the ID.
    await order.save();

    // Notify Restaurant
    const io = req.app.get("socketio");
    if (io) {
      io.to(`restaurant_${order.restaurantId}`).emit("orderDeliveryAccepted", order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reached Restaurant
router.patch("/:id/delivery-reached", protectDelivery, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "reached_restaurant";
    order.timeline.push({ status: "reached_restaurant", description: "Delivery partner reached restaurant" });
    await order.save();

    // Notify Restaurant
    const io = req.app.get("socketio");
    if (io) {
      io.to(`restaurant_${order.restaurantId}`).emit("orderUpdated", order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pick Up Order (Update to Out for Delivery)
router.patch("/:id/delivery-pickup", protectDelivery, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "out_for_delivery";
    order.timeline.push({ status: "out_for_delivery", description: "Picked up by delivery partner" });
    await order.save();

    // Notify Customer & Restaurant
    const io = req.app.get("socketio");
    if (io) {
      if (order.customerId) {
        io.to(`customer_${order.customerId}`).emit("orderStatusUpdated", {
          orderId: order._id,
          status: "out_for_delivery"
        });
      }
      io.to(`restaurant_${order.restaurantId}`).emit("orderUpdated", order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete Delivery
router.patch("/:id/delivery-complete", protectDelivery, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "completed";
    order.timeline.push({ status: "completed", description: "Delivered to customer" });
    await order.save();

    // Notify Customer & Restaurant
    const io = req.app.get("socketio");
    if (io) {
      if (order.customerId) {
        io.to(`customer_${order.customerId}`).emit("orderStatusUpdated", {
          orderId: order._id,
          status: "completed"
        });
      }
      io.to(`restaurant_${order.restaurantId}`).emit("orderUpdated", order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Order (Soft Delete for Restaurant)
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only restaurants can delete orders." });
    }

    const order = await Order.findOne({ _id: id, restaurantId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // Soft Delete instead of hard delete
    order.isDeletedByRestaurant = true;
    await order.save();

    res.json({ message: "Order hidden from restaurant dashboard" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
