import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";
import FoodItem from "../models/FoodItem.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * =========================================================================
 * AUTHENTICATION ROUTES
 * =========================================================================
 */

// REGISTER
router.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Input Validation & XSS Check
    if (!email || email.length > 254) {
      return res.status(400).json({ message: "Invalid email length" });
    }
    if (/[<>]/.test(email)) {
      return res.status(400).json({ message: "Invalid characters in email" });
    }
    if (!password || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 6 and 128 characters" });
    }

    // Validate name
    if (name && name.length > 100) {
      return res.status(400).json({ message: "Name is too long" });
    }
    if (name && /[<>]/.test(name)) {
      return res.status(400).json({ message: "Invalid characters in name" });
    }

    // Validate phone
    if (phone && phone.length > 20) {
      return res.status(400).json({ message: "Phone number is too long" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Normalize email
    const [localPart, domain] = email.split("@");
    if (!domain) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const normalizedLocal = localPart.split("+")[0].trim().toLowerCase();
    const normalizedDomain = domain.trim().toLowerCase();
    const normalizedEmail = `${normalizedLocal}@${normalizedDomain}`;

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name || "",
      phone: phone || "",
      role: "user",
    });

    // Generate Token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "temp_secret",
      { expiresIn: "1d" }
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
    };

    res.json({ success: true, message: "User registered", token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input Validation
    if (!email || email.length > 254) {
      return res.status(400).json({ message: "Invalid email length" });
    }
    if (/[<>]/.test(email)) {
      return res.status(400).json({ message: "Invalid characters in email" });
    }
    if (!password || password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 6 and 128 characters" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const [localPart, domain] = email.split("@");
    if (!domain) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const normalizedLocal = localPart.split("+")[0].trim().toLowerCase();
    const normalizedDomain = domain.trim().toLowerCase();
    const normalizedEmail = `${normalizedLocal}@${normalizedDomain}`;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "temp_secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGOUT
router.post("/auth/logout", async (req, res) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    await TokenBlocklist.create({ token });

    res.clearCookie("token");

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ACCOUNT
router.delete("/auth/delete-account", async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    await TokenBlocklist.create({ token });
    await FoodItem.deleteMany({ restaurantId: userId }); // Clean up potential food items

    res.clearCookie("token");

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * =========================================================================
 * RESTAURANT ROUTES
 * =========================================================================
 */

// Get Restaurant Profile
router.get("/restaurant/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Restaurant Profile
router.put("/restaurant/profile", protect, async (req, res) => {
  try {
    const { name, phone, address, cuisineType, isOpen, profileImage } = req.body;

    // XSS Protection
    if ([name, address, cuisineType, phone].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    if (name && name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (phone && phone.length > 20) return res.status(400).json({ message: "Phone must be under 20 characters" });
    if (address && address.length > 500) return res.status(400).json({ message: "Address must be under 500 characters" });
    if (cuisineType && cuisineType.length > 100) return res.status(400).json({ message: "Cuisine Type must be under 100 characters" });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (address && user.addresses.length > 0) {
      user.addresses[0].street = address;
    }
    user.cuisineType = cuisineType || user.cuisineType;
    user.isOpen = isOpen !== undefined ? isOpen : user.isOpen;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();
    const responseUser = updatedUser.toObject();
    delete responseUser.password;

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Restaurant Account
// Note: This logic duplicates /auth/delete-account essentially, but keeping for compatibility if specific specific endpoint was used
router.delete("/restaurant/profile", protect, async (req, res) => {
  // Forward to general delete account logic or re-implement
  // For simplicity, re-implementing logic here securely
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await User.findByIdAndDelete(req.user._id);
    await FoodItem.deleteMany({ restaurantId: req.user._id });

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * =========================================================================
 * FOOD ITEM ROUTES
 * =========================================================================
 */

// Create Food Item
router.post("/restaurant/food-items", protect, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, Price, and Category are required" });
    }
    if (name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (description && description.length > 500) return res.status(400).json({ message: "Description must be under 500 characters" });
    if (category.length > 50) return res.status(400).json({ message: "Category must be under 50 characters" });

    if ([name, description, category].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    const foodItem = await FoodItem.create({
      restaurantId: req.user._id, // req.user is set by protect middleware
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
router.get("/restaurant/food-items", protect, async (req, res) => {
  try {
    const foodItems = await FoodItem.find({ restaurantId: req.user._id }).sort({ createdAt: -1 });
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Food Item
router.put("/restaurant/food-items/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

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
router.delete("/restaurant/food-items/:id", protect, async (req, res) => {
  try {
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


/**
 * =========================================================================
 * USER ROUTES
 * =========================================================================
 */

// Get User Profile
router.get("/user/profile", protect, async (req, res) => {
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

// Update User Profile
router.put("/user/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.name && req.body.name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (req.body.email && req.body.email.length > 254) return res.status(400).json({ message: "Email must be under 254 characters" });
    if (req.body.phone && req.body.phone.length > 20) return res.status(400).json({ message: "Phone must be under 20 characters" });
    if (req.body.profileImage && req.body.profileImage.length > 1048576) return res.status(400).json({ message: "Profile image URI is too long" });

    if ([req.body.name, req.body.email, req.body.phone].some(field => field && /[<>]/.test(field))) {
      return res.status(400).json({ message: "Invalid characters detected (HTML tags are not allowed)" });
    }

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.profileImage = req.body.profileImage || user.profileImage;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        addresses: updatedUser.addresses,
        role: updatedUser.role,
        token: req.headers.authorization.split(" ")[1],
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Addresses
router.get("/user/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Address
router.post("/user/addresses", protect, async (req, res) => {
  try {
    const { label, street, city, state, pincode, landmark, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({
      label, street, city, state, pincode, landmark, isDefault: shouldBeDefault
    });

    await user.save();
    res.status(201).json(user.addresses[user.addresses.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Address
router.delete("/user/addresses/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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


/**
 * =========================================================================
 * PUBLIC ROUTES (No authentication required)
 * =========================================================================
 */

// GET ALL RESTAURANTS (Public)
router.get("/public/restaurants", async (req, res) => {
  try {
    const restaurants = await User.find({ role: 'user' })
      .select('-password -email -phone -addresses')
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH (Public - Food Items OR Restaurants)
router.get("/public/search", async (req, res) => {
  try {
    const { query, type, tags } = req.query;
    let results = [];
    let dbQuery = {};

    if (type === 'food') {
      if (query) {
        dbQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
      }

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        dbQuery.$or = [
          ...(dbQuery.$or || []),
          { tags: { $in: tagList.map(t => new RegExp(t, 'i')) } },
          { category: { $in: tagList.map(t => new RegExp(t, 'i')) } }
        ];
        if (!query && dbQuery.$or.length === 0) {
          delete dbQuery.$or;
        }
      }

      if (!query && tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        dbQuery = {
          $or: [
            { tags: { $in: tagList.map(t => new RegExp(t, 'i')) } },
            { category: { $in: tagList.map(t => new RegExp(t, 'i')) } },
            { name: { $in: tagList.map(t => new RegExp(t, 'i')) } }
          ]
        };
      }

      results = await FoodItem.find(dbQuery).populate('restaurantId', 'name profileImage');
    } else {
      if (query) {
        dbQuery = {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { cuisineType: { $regex: query, $options: 'i' } }
          ],
          role: 'user'
        };
      }
      results = await User.find(dbQuery).select('-password -email -phone -addresses');
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
