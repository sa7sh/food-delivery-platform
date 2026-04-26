import express from "express";
import User from "../models/User.js";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET USER PROFILE
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE USER PROFILE
router.put("/profile", protect, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (req.file) user.profileImage = req.file.path;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET FAVORITES
router.get("/favorites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites", "-password");
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TOGGLE FAVORITE
router.post("/favorites/:restaurantId", protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(restaurantId);

    if (index === -1) {
      user.favorites.push(restaurantId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ADDRESSES
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD ADDRESS
router.post("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { isDefault } = req.body;

    if (isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push({ ...req.body, isDefault: isDefault || user.addresses.length === 0 });

    await user.save();
    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ADDRESS
router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ message: "Address removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUBLIC ROUTES
 */

// GET ALL RESTAURANTS
router.get("/public/restaurants", async (req, res) => {
  try {
    const { cuisine, isOpen, query, page = 1, limit = 20 } = req.query;
    let dbQuery = { role: { $in: ['user', 'restaurant'] } };

    if (cuisine) dbQuery.cuisineType = { $regex: cuisine, $options: 'i' };
    if (isOpen === 'true') dbQuery.isOpen = true;
    if (query) {
      dbQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { cuisineType: { $regex: query, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [restaurants, total] = await Promise.all([
      User.find(dbQuery).select('-password -email -phone -addresses').skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(dbQuery)
    ]);

    res.json({ restaurants, pagination: { page, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET SINGLE RESTAURANT DETAIL
router.get("/public/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await User.findOne({ _id: req.params.id, role: { $in: ['user', 'restaurant'] } })
      .select('-password -email -phone -otp -otpExpires -otpAttempts')
      .lean();

    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH
router.get("/public/search", async (req, res) => {
  try {
    const { query, type, dietary, sortBy } = req.query;
    if (!query) return res.json([]);

    const regex = new RegExp(query, "i");
    let results = [];

    if (!type || type === 'restaurant') {
      results = await User.find({
        role: { $in: ["restaurant", "user"] },
        $or: [{ name: regex }, { cuisineType: regex }]
      }).select("-password -otp -otpExpires -otpAttempts");
    }

    if (!type || type === 'food') {
      const foods = await FoodItem.find({
        $or: [{ name: regex }, { description: regex }],
        isAvailable: true,
        ...(dietary === 'veg' && { isVeg: true })
      }).populate('restaurantId', 'name profileImage addresses');
      results = [...results, ...foods];
    }

    if (sortBy === 'rating') {
      results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
