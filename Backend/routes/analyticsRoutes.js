import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Restaurant Analytics
router.get("/stats", protect, async (req, res) => {
  try {
    // Ensure user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const restaurantId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch all relevant orders
    const allOrders = await Order.find({
      restaurantId,
      status: { $ne: 'cancelled' }
    });

    // 2. Calculate KPI functionality
    const totalRevenue = allOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);

    const todayRevenue = todayOrders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeOrders = allOrders.filter(o =>
      ['pending', 'accepted', 'preparing', 'ready', 'placed'].includes(o.status)
    ).length;

    // 3. Calculate Weekly Graph Data (Last 7 Days)
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dateString);

      // Filter orders for this specific day
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayRevenue = allOrders
        .filter(o => {
          const oDate = new Date(o.createdAt);
          return oDate >= dayStart && oDate <= dayEnd && (o.status === 'completed' || o.status === 'delivered');
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      data.push(dayRevenue);
    }

    res.json({
      totalRevenue,
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      activeOrders,
      weeklyStats: {
        labels,
        data
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
