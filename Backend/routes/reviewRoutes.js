import express from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Reviews (Restaurant + Food Items)
router.post("/", protect, async (req, res) => {
  try {
    console.log('[ReviewRoutes] POST / - Review submission received');
    console.log('[ReviewRoutes] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[ReviewRoutes] Authenticated user:', req.user?._id, req.user?.name);

    const { orderId, restaurantId, restaurantRating, restaurantComment, foodItemReviews } = req.body;

    // Validation
    if (!orderId || !restaurantId) {
      console.log('[ReviewRoutes] Validation failed: Missing orderId or restaurantId');
      return res.status(400).json({ message: "Missing orderId or restaurantId" });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, customerId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    const createdReviews = [];

    // 1. Create Restaurant Review (if provided)
    if (restaurantRating) {
      if (restaurantRating < 1 || restaurantRating > 5) {
        return res.status(400).json({ message: "Restaurant rating must be between 1 and 5" });
      }

      if (order.restaurantReviewed) {
        return res.status(400).json({ message: "Restaurant already reviewed" });
      }

      const restaurantReview = await Review.create({
        orderId,
        customerId: req.user._id,
        restaurantId,
        reviewType: "restaurant",
        rating: restaurantRating,
        comment: restaurantComment || "",
      });

      createdReviews.push(restaurantReview);
      order.restaurantReviewed = true;
    }

    // 2. Create Food Item Reviews (if provided)
    if (foodItemReviews && Array.isArray(foodItemReviews) && foodItemReviews.length > 0) {
      for (const itemReview of foodItemReviews) {
        const { foodItemId, rating, comment } = itemReview;

        if (!foodItemId || !rating) {
          continue; // Skip invalid entries
        }

        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: "Food item rating must be between 1 and 5" });
        }

        // Check if already reviewed
        if (order.itemsReviewed.includes(foodItemId)) {
          continue; // Skip already reviewed items
        }

        const foodReview = await Review.create({
          orderId,
          customerId: req.user._id,
          restaurantId,
          reviewType: "food_item",
          foodItemId,
          rating,
          comment: comment || "",
        });

        createdReviews.push(foodReview);
        order.itemsReviewed.push(foodItemId);

        // Update food item's average rating
        const foodItem = await FoodItem.findById(foodItemId);
        if (foodItem) {
          const allFoodReviews = await Review.find({ foodItemId, reviewType: "food_item" });
          const totalReviews = allFoodReviews.length;
          const averageRating = totalReviews > 0
            ? (allFoodReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

          foodItem.averageRating = parseFloat(averageRating);
          foodItem.totalReviews = totalReviews;
          await foodItem.save();
        }
      }
    }

    await order.save();

    res.status(201).json({
      message: "Reviews submitted successfully",
      reviews: createdReviews,
    });
  } catch (error) {
    console.error("Error creating reviews:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get Restaurant Reviews
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurantId, reviewType: "restaurant" })
      .populate("customerId", "name profileImage")
      .sort({ createdAt: -1 });

    // Calculate Average Rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Food Item Reviews
router.get("/food/:foodItemId", async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const reviews = await Review.find({ foodItemId, reviewType: "food_item" })
      .populate("customerId", "name profileImage")
      .sort({ createdAt: -1 });

    // Calculate Average Rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Food Item Reviews for a Restaurant
router.get("/restaurant/:restaurantId/food-items", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurantId, reviewType: "food_item" })
      .populate("customerId", "name profileImage")
      .populate("foodItemId", "name imageUrl")
      .sort({ createdAt: -1 });

    res.json({
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
