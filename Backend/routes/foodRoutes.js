import express from "express";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================================
 * PUBLIC ROUTES
 * =========================================================================
 */

/* Customer → GET ALL FOODS */
router.get("/", async (req, res) => {
  try {
    const foods = await FoodItem.find({ isAvailable: true })
      .populate('restaurantId', 'name profileImage cuisineType address')
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Home Screen → Latest Foods */
router.get("/latest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const foods = await FoodItem.find({ isAvailable: true })
      .populate('restaurantId', 'name profileImage cuisineType address')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Search Foods */
router.get("/search", async (req, res) => {
  try {
    const { query, isOpen } = req.query;
    let dbQuery = {
      name: { $regex: query, $options: "i" },
      isAvailable: true
    };

    const foods = await FoodItem.find(dbQuery)
      .populate('restaurantId', 'name profileImage cuisineType address isOpen'); // Populate isOpen

    // If isOpen filter is requested, filter in memory since we can't easily query populated fields in standard Mongo without aggregation
    if (isOpen === 'true') {
      const openFoods = foods.filter(food => food.restaurantId && food.restaurantId.isOpen);
      return res.json(openFoods);
    }

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Get food items by restaurant ID (Public) */
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

/**
 * =========================================================================
 * PROTECTED RESTAURANT ROUTES
 * =========================================================================
 */

/* Restaurant → ADD FOOD */
import upload from "../middleware/uploadMiddleware.js"; // Import Middleware

router.post("/", protect, upload.single('image'), async (req, res) => {
  try {
    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    const { name, description, price, category, isAvailable } = req.body;
    let imageUrl = req.body.imageUrl; // Callback for old logic or if no file

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, Price, and Category are required" });
    }
    // ... validation ...
    if (name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (description && description.length > 500) return res.status(400).json({ message: "Description must be under 500 characters" });
    if (category.length > 50) return res.status(400).json({ message: "Category must be under 50 characters" });

    // Sanitize input
    if ([name, description, category].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    const food = await FoodItem.create({
      restaurantId: req.user._id,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVeg: req.body.isVeg !== undefined ? req.body.isVeg : true,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: "Add food failed: " + error.message });
  }
});

/* Restaurant → GET MY FOODS */
router.get("/my-foods", protect, async (req, res) => {
  try {
    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    const foods = await FoodItem.find({ restaurantId: req.user._id }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Restaurant → UPDATE FOOD */
router.put("/:id", protect, upload.single('image'), async (req, res) => {
  try {
    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    if (name && name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (description && description.length > 500) return res.status(400).json({ message: "Description must be under 500 characters" });
    if (category && category.length > 50) return res.status(400).json({ message: "Category must be under 50 characters" });

    if ([name, description, category].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    const foodItem = await FoodItem.findOne({ _id: id, restaurantId: req.user._id });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found or unauthorized" });
    }

    const updateData = {
      name,
      description,
      price,
      category,
      isAvailable,
      isVeg: req.body.isVeg,
    };

    // Only update image if a new one is provided or explicitly passed
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Restaurant → DELETE FOOD */
router.delete("/:id", protect, async (req, res) => {
  try {
    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    const { id } = req.params;
    const deletedItem = await FoodItem.findOneAndDelete({ _id: id, restaurantId: req.user._id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Food item not found or unauthorized" });
    }

    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Restaurant → TOGGLE AVAILABILITY */
router.patch("/:id/availability", protect, async (req, res) => {
  try {
    // Verify user is a restaurant
    if (!['restaurant', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Restaurant account required." });
    }

    const { id } = req.params;
    const { isAvailable } = req.body;

    const foodItem = await FoodItem.findOne({ _id: id, restaurantId: req.user._id });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found or unauthorized" });
    }

    foodItem.isAvailable = isAvailable;
    await foodItem.save();

    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
