import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET RESTAURANT STATS
router.get("/stats", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      { $match: { restaurantId: req.user._id, createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          activeOrders: {
            $sum: { $cond: [{ $in: ["$status", ["pending", "preparing", "ready"]] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats[0] || { totalRevenue: 0, orderCount: 0, activeOrders: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET RESTAURANT PROFILE
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Restaurant not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE RESTAURANT PROFILE
router.put("/profile", protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'restaurantImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, address, cuisineType, isOpen } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (cuisineType) user.cuisineType = cuisineType;
    if (isOpen !== undefined) user.isOpen = isOpen;

    if (req.files) {
      if (req.files.profileImage) user.profileImage = req.files.profileImage[0].path;
      if (req.files.restaurantImage) user.restaurantImage = req.files.restaurantImage[0].path;
    }

    if (address) {
      if (user.addresses.length > 0) user.addresses[0].street = address;
      else user.addresses.push({ label: "Restaurant", street: address, city: "Unknown", state: "Unknown", pincode: "000000", isDefault: true });
      user.markModified("addresses");
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
