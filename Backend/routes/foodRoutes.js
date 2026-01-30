import express from "express";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Restaurant (Mobile + Web) → ADD FOOD */
router.post("/", protect, async (req, res) => {
  try {
    const food = await FoodItem.create({
      ...req.body,
      restaurantId: req.user._id
    });

    res.status(201).json(food);
  } catch (e) {
    res.status(500).json({ message: "Add food failed" });
  }
});

/* Customer → GET ALL FOODS */
router.get("/", async (req, res) => {
  const foods = await FoodItem.find({ isAvailable: true })
    .populate('restaurantId', 'name profileImage cuisineType address')
    .sort({ createdAt: -1 });
  res.json(foods);
});

/* Home Screen → Latest Foods */
router.get("/latest", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const foods = await FoodItem.find({ isAvailable: true })
    .populate('restaurantId', 'name profileImage cuisineType address')
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(foods);
});

/* Search Foods */
router.get("/search", async (req, res) => {
  const { query } = req.query;

  const foods = await FoodItem.find({
    name: { $regex: query, $options: "i" },
    isAvailable: true
  }).populate('restaurantId', 'name profileImage cuisineType address');

  res.json(foods);
});

/* Get food items by restaurant ID */
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foods = await FoodItem.find({
      restaurantId: restaurantId,
      isAvailable: true
    }).sort({ createdAt: -1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
