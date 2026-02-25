import express from "express";
import { protectDelivery } from "../middleware/deliveryAuthMiddleware.js";
import Order from "../models/Order.js"; // Standard Order model
import DeliveryPartner from "../models/DeliveryPartner.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 1. Toggle Online/Offline Status
router.post("/status", protectDelivery, async (req, res) => {
    try {
        const { isOnline } = req.body;

        // Use findByIdAndUpdate to only modify isOnline — avoids triggering
        // full-document validation (which fails for partners missing required fields)
        const updated = await DeliveryPartner.findByIdAndUpdate(
            req.partner._id,
            { $set: { isOnline } },
            { new: true, runValidators: false }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        res.json({ success: true, isOnline: updated.isOnline, message: isOnline ? "You are now ONLINE" : "You are now OFFLINE" });
    } catch (error) {
        console.error("Toggle status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Get Dashboard Stats (Earnings, Rides)
router.get("/dashboard", protectDelivery, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter orders for this partner that are completed and from today
        // We use updatedAt to track when the earning was realized
        const todayOrders = await Order.find({
            deliveryPartnerId: req.partner._id,
            status: "completed",
            updatedAt: { $gte: today }
        });

        // Use consistent fee
        const DELIVERY_FEE = 40;
        const totalEarnings = todayOrders.length * DELIVERY_FEE;

        res.json({
            success: true,
            earnings: totalEarnings,
            rides: todayOrders.length,
            hours: 0, // Mock value, or implement shift tracking later
            isOnline: req.partner.isOnline
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Get Available Orders (Nearby)
router.get("/orders/available", protectDelivery, async (req, res) => {
    try {
        // Logic: Find orders that are 'ready' AND have no delivery partner assigned yet
        // In a real app, you'd filter by location (GeoJSON)

        const availableOrders = await Order.find({
            status: "ready",
            deliveryPartnerId: null
        }).populate("restaurantId", "name address phone")
            .sort({ createdAt: -1 }); // Newest first

        // Transform for UI
        const formattedOrders = availableOrders.map(order => ({
            id: order._id,
            restaurant: order.restaurantId.name,
            location: order.restaurantId.addresses?.[0]?.street || "Unknown Location",
            distance: "2.5", // Mock distance
            pay: "50", // Mock pay
            items: order.items.length,
            itemNames: order.items.map(i => i.name).join(", "),
            totalAmount: order.totalAmount
        }));

        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Accept Order
router.post("/orders/:id/accept", protectDelivery, async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.deliveryPartnerId) {
            return res.status(400).json({ message: "Order already accepted by another partner" });
        }

        order.deliveryPartnerId = req.partner._id;
        order.status = "out_for_delivery"; // Or keep 'ready' until pickup? Let's say accepting means you are going for it.
        // Actually, usually: Accepted -> Going to Store.
        // Let's stick to simple: Accepted maps to 'out_for_delivery' or we add 'accepted' status.
        // The Order model has "accepted" (by restaurant), "ready" (by restaurant).
        // Let's use "out_for_delivery" as the state when driver picks it up.
        // For now, let's just assign the partner.

        await order.save();

        // Initialize socket here if needed to notify user/restaurant
        // const io = req.app.get("socketio");
        // io.to(`order_${orderId}`).emit("orderUpdate", { status: "partner_assigned" });

        res.json({ success: true, message: "Order Accepted", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Update Order Status (Pickup / Complete / Reached)
router.patch("/orders/:id/status", protectDelivery, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["out_for_delivery", "completed", "reached_restaurant", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        console.log(`[StatusUpdate] Request for Order: ${req.params.id} by Partner: ${req.partner._id}`);
        console.log(`[StatusUpdate] New Status: ${status}`);

        const order = await Order.findOne({
            _id: req.params.id,
            deliveryPartnerId: req.partner._id
        });

        if (!order) {
            console.log(`[StatusUpdate] Order NOT FOUND or NOT ASSIGNED. Checking order by ID only...`);
            const checkOrder = await Order.findById(req.params.id);
            if (checkOrder) {
                console.log(`[StatusUpdate] Order exists but assigned to: ${checkOrder.deliveryPartnerId}`);
            } else {
                console.log(`[StatusUpdate] Order does not exist at all in DB.`);
            }
            return res.status(404).json({ message: "Order not found or not assigned to you" });
        }

        order.status = status;
        await order.save();

        // 🔔 REAL-TIME NOTIFICATION
        const io = req.app.get("socketio");
        if (io) {
            // Notify Customer
            if (order.customerId) {
                io.to(`customer_${order.customerId}`).emit("orderStatusUpdated", {
                    orderId: order._id,
                    status: status
                });
                console.log(`[Socket] Emitted 'orderStatusUpdated' to customer_${order.customerId}: ${status}`);
            }

            // Notify Restaurant
            if (order.restaurantId) {
                io.to(`restaurant_${order.restaurantId}`).emit("orderUpdated", order);
                console.log(`[Socket] Emitted 'orderUpdated' to restaurant_${order.restaurantId}: ${status}`);
            }
        }

        res.json({ success: true, message: `Order marked as ${status}`, order });
    } catch (error) {
        console.error("Status update error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Deprecated Status Update (keeping for compatibility if needed, but updating it too)
router.post("/orders/:id/update-status", protectDelivery, async (req, res) => {
    // Redirect to the new logic
    req.method = 'PATCH';
    router.handle(req, res);
});

// 6. Get Active Order (if any)
router.get("/orders/active", protectDelivery, async (req, res) => {
    try {
        const activeOrder = await Order.findOne({
            deliveryPartnerId: req.partner._id,
            status: { $in: ["ready", "out_for_delivery"] } // Orders in progress
        }).populate("restaurantId", "name address phone coordinates")
            .populate("customerId", "name phone addresses");

        if (!activeOrder) {
            return res.json({ success: true, activeOrder: null });
        }

        // Transform for UI
        const formattedOrder = {
            id: activeOrder._id,
            restaurant: activeOrder.restaurantId.name,
            restaurantAddress: activeOrder.restaurantId.addresses?.[0]?.street,
            customerName: activeOrder.customer.name, // Saved snapshot name
            customerPhone: activeOrder.customer.phone,
            customerAddress: activeOrder.deliveryAddress,
            items: activeOrder.items,
            status: activeOrder.status,
            totalAmount: activeOrder.totalAmount,
            pay: "40" // Matching fixed delivery fee
        };

        res.json({ success: true, activeOrder: formattedOrder });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. Update Profile Image
router.put("/profile/image", protectDelivery, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image provided" });
        }

        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.partner._id,
            { profileImage: req.file.path },
            { new: true, runValidators: false }
        );

        if (!partner) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        res.json({
            success: true,
            message: "Profile image updated successfully",
            partner
        });
    } catch (error) {
        console.error("Profile image upload error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 8. Get Lifetime Profile Stats
router.get("/profile-stats", protectDelivery, async (req, res) => {
    try {
        const partnerId = req.partner._id;

        // 1. Total Trips (Completed Orders)
        const totalTrips = await Order.countDocuments({
            deliveryPartnerId: partnerId,
            status: "completed"
        });

        // 2. Partner Data
        const partner = await DeliveryPartner.findById(partnerId);

        res.json({
            success: true,
            stats: {
                trips: totalTrips,
                rating: partner.averageRating || 5.0,
                joinedAt: partner.createdAt
            }
        });
    } catch (error) {
        console.error("Profile stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
