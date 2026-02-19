import express from "express";
import DeliveryPartner from "../models/DeliveryPartner.js";
import Order from "../models/Order.js";

const router = express.Router();

// POST /api/delivery-rating/rate
router.post('/rate', async (req, res) => {
  try {
    const { orderId, deliveryPartnerId, rating, review, userId } = req.body;

    if (!orderId || !deliveryPartnerId || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const partner = await DeliveryPartner.findById(deliveryPartnerId);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Delivery Partner not found" });
    }

    // Verify Order Status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'completed' && order.status !== 'out_for_delivery') {
      return res.status(400).json({ success: false, message: "You can only rate after delivery is complete." });
    }

    if (order.deliveryPartnerId.toString() !== deliveryPartnerId) {
      return res.status(400).json({ success: false, message: "This partner did not deliver this order." });
    }

    // Check if rating exists for this order
    const existingRatingIndex = partner.ratings.findIndex(r => r.orderId && r.orderId.toString() === orderId);

    if (existingRatingIndex > -1) {
      // Update existing
      partner.ratings[existingRatingIndex].rating = Number(rating);
      partner.ratings[existingRatingIndex].review = review;
      partner.ratings[existingRatingIndex].createdAt = new Date(); // Update timestamp
    } else {
      // Add new rating
      const newRating = {
        rating: Number(rating),
        review,
        user: userId,
        orderId: orderId, // Store orderId
        createdAt: new Date()
      };
      partner.ratings.push(newRating);
    }

    // Recalculate Average
    const totalRating = partner.ratings.reduce((sum, item) => sum + item.rating, 0);
    partner.averageRating = (totalRating / partner.ratings.length).toFixed(1);

    await partner.save();

    // Mark delivery as reviewed
    order.deliveryReviewed = true;
    await order.save();

    res.status(200).json({ success: true, message: "Rating submitted successfully", averageRating: partner.averageRating });

  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/delivery-rating/:id
router.get('/:id', async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id).select('name averageRating ratings');
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });

    res.status(200).json({ success: true, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
