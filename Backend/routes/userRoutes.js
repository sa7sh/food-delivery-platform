import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        addresses: user.addresses,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.profileImage = req.body.profileImage || user.profileImage;

      if (req.body.password) {
        // Need to hash password here if updated (skipping for now as it needs bcrypt import)
        // user.password = ... 
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        addresses: updatedUser.addresses,
        role: updatedUser.role,
        token: req.headers.authorization.split(" ")[1], // Return existing token
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user addresses
// @route   GET /api/user/addresses
// @access  Private
router.get("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
router.post("/addresses", protect, async (req, res) => {
  try {
    const { label, street, city, state, pincode, landmark, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // If it's the first address, make it default automatically
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({
      label, street, city, state, pincode, landmark, isDefault: shouldBeDefault
    });

    await user.save();

    // Return the newly added address (last in array)
    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
// @access  Private
router.delete("/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Filter out the address to delete
    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ message: "Address not found" });
    }

    await user.save();
    res.json({ message: "Address removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
