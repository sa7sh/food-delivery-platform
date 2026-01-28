import express from "express";
import User from "../models/User.js";
import FoodItem from "../models/FoodItem.js";
import { protect as authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Restaurant Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Restaurant Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, cuisineType, isOpen, profileImage } = req.body;

    // XSS Protection: Reject HTML tags
    if ([name, address, cuisineType, phone].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    // Input Validation
    if (name && name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (phone && phone.length > 20) return res.status(400).json({ message: "Phone must be under 20 characters" });
    if (address && address.length > 500) return res.status(400).json({ message: "Address must be under 500 characters" });
    if (cuisineType && cuisineType.length > 100) return res.status(400).json({ message: "Cuisine Type must be under 100 characters" });

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    // user.address = address || user.address; // Legacy field removed
    if (address && user.addresses.length > 0) {
      user.addresses[0].street = address; // Update main address street if exists
    } else if (address) {
      // Only push if we have enough info, or just skip to avoid validation error
    }
    user.cuisineType = cuisineType || user.cuisineType;
    user.isOpen = isOpen !== undefined ? isOpen : user.isOpen;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();

    // remove password from response
    const responseUser = updatedUser.toObject();
    delete responseUser.password;

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Restaurant Account
router.delete("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await User.findByIdAndDelete(req.user.userId);

    // Optional: Delete all food items associated with this restaurant
    await FoodItem.deleteMany({ restaurantId: req.user.userId });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// FOOD ITEM ROUTES
// ==========================================

// Create Food Item
router.post("/food-items", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, Price, and Category are required" });
    }
    if (name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (description && description.length > 500) return res.status(400).json({ message: "Description must be under 500 characters" });
    if (category.length > 50) return res.status(400).json({ message: "Category must be under 50 characters" });

    // XSS Protection: Reject HTML tags
    if ([name, description, category].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }


    const foodItem = await FoodItem.create({
      restaurantId: req.user.userId,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Food Items (for logged-in restaurant)
router.get("/food-items", authMiddleware, async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ restaurantId: req.user.userId }).sort({ createdAt: -1 });
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Food Item
router.put("/food-items/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    // Validation
    if (name && name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (description && description.length > 500) return res.status(400).json({ message: "Description must be under 500 characters" });
    if (category && category.length > 50) return res.status(400).json({ message: "Category must be under 50 characters" });

    // XSS Protection: Reject HTML tags
    if ([name, description, category].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }


    // Ensure the food item belongs to the logged-in restaurant
    const foodItem = await FoodItem.findOne({ _id: id, restaurantId: req.user.userId });

    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found or unauthorized" });
    }

    const updatedItem = await FoodItem.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        category,
        imageUrl,
        isAvailable,
      },
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Food Item
router.delete("/food-items/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await FoodItem.findOneAndDelete({ _id: id, restaurantId: req.user.userId });

    if (!deletedItem) {
      return res.status(404).json({ message: "Food item not found or unauthorized" });
    }

    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
