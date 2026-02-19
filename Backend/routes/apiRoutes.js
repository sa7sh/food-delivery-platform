import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs"; // Added for debugging
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";
import FoodItem from "../models/FoodItem.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Restaurant Stats - MOVED TO TOP to avoid shadowing
router.get("/restaurant/stats", protect, async (req, res) => {
  try {
    console.log(`[Backend] GET /restaurant/stats HIT for: ${req.user._id}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchStage = {
      restaurantId: req.user._id,
      createdAt: { $gte: today }
    };

    // Calculate today's stats
    const todayStatsPromise = Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["pending", "preparing", "ready"]] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Calculate weekly stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyStatsPromise = Order.aggregate([
      {
        $match: {
          restaurantId: req.user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const [todayResult, weeklyResult] = await Promise.all([todayStatsPromise, weeklyStatsPromise]);

    const stats = todayResult[0] || { totalRevenue: 0, orderCount: 0, activeOrders: 0 };
    console.log(`[Backend] Stats calculated: ${JSON.stringify(stats)}`);

    // Format weekly data ensuring all days are represented
    const daysMap = { 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" };
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayIndex = d.getDay() + 1;
      labels.push(daysMap[dayIndex]);

      const found = weeklyResult.find(r => r._id === dayIndex);
      data.push(found ? found.revenue : 0);
    }

    res.json({
      todayOrdersCount: stats.orderCount,
      todayRevenue: stats.totalRevenue,
      activeOrders: stats.activeOrders,
      weeklyStats: { labels, data }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
});

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
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name || "",
      phone: phone || "",
      role: (req.body.role && ["user", "customer", "restaurant"].includes(req.body.role))
        ? req.body.role
        : "user",
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
        isOpen: user.isOpen,
        restaurantImage: user.restaurantImage,
        cuisineType: user.cuisineType,
        address: user.addresses && user.addresses.length > 0 ? user.addresses[0].street : "",
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

// ============================================
// OTP AUTHENTICATION
// ============================================
import sendEmail from "../utils/sendEmail.js";

// Send OTP
router.post("/auth/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 60 * 1000; // 1 minute

    // Save to user (reset attempts)
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    console.log(`[Backend] OTP for ${email}: ${otp}`); // For debugging (since we might not have real email)

    // Send Email
    try {
      await sendEmail({
        email: user.email,
        subject: "Your Login OTP",
        message: `Your OTP is ${otp}. It expires in 1 minute.`,
        html: `<p>Your OTP is <b>${otp}</b>. It expires in 1 minute.</p>`
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP & Login
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user explicitly selecting OTP fields
    const user = await User.findOne({ email: normalizedEmail }).select("+otp +otpExpires +otpAttempts");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: "Too many failed attempts. Please request a new OTP." });
    }

    // Check expiry
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check OTP match
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    // Valid OTP - Login Success
    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    // Generate Token (Same as login)
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
        isOpen: user.isOpen,
        restaurantImage: user.restaurantImage,
        cuisineType: user.cuisineType,
        address: user.addresses && user.addresses.length > 0 ? user.addresses[0].street : "",
      },
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
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


// ============================================
// FAVORITES ROUTES
// ============================================

// Get User Favorites
router.get("/user/favorites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      select: "-password -favorites", // Exclude sensitive data
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Favorite
router.post("/user/favorites/:restaurantId", protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`[Backend] Toggling favorite for User: ${req.user._id}, Restaurant: ${restaurantId}`);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure favorites array exists
    if (!user.favorites) user.favorites = [];

    const index = user.favorites.indexOf(restaurantId);
    let isFavorited = false;

    if (index === -1) {
      // Add to favorites
      console.log('[Backend] Adding to favorites');
      user.favorites.push(restaurantId);
      isFavorited = true;
    } else {
      // Remove from favorites
      console.log('[Backend] Removing from favorites');
      user.favorites.splice(index, 1);
      isFavorited = false;
    }

    await user.save();
    console.log(`[Backend] User saved. Favorites count: ${user.favorites.length}`);

    res.json({ success: true, isFavorited, favorites: user.favorites });
  } catch (error) {
    console.error('[Backend] Toggle error:', error);
    res.status(500).json({ message: error.message });
  }
});


/**
 * =========================================================================
 * RESTAURANT ROUTES
 * =========================================================================
 */

// Get Restaurant Stats
router.get("/restaurant/stats", protect, async (req, res) => {
  try {
    console.log(`[Backend] GET /restaurant/stats HIT for User: ${req.user._id}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const todayStats = await Order.aggregate([
      { $match: { restaurantId: req.user._id, createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $in: ["$status", ["pending", "preparing", "ready"]] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = todayStats[0] || { totalRevenue: 0, orderCount: 0, activeOrders: 0 };

    // Weekly stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyStats = await Order.aggregate([
      {
        $match: {
          restaurantId: req.user._id,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } } // Sort by date
    ]);

    // Format weekly data ensuring all 7 days are represented
    const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const labels = [];
    const data = [];
    const weeklyDataMap = new Map(weeklyStats.map(item => [item._id, item.revenue]));

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      labels.push(daysMap[d.getDay()]);
      data.push(weeklyDataMap.get(dateString) || 0);
    }

    res.json({
      todayOrdersCount: stats.orderCount,
      todayRevenue: stats.totalRevenue,
      activeOrders: stats.activeOrders,
      weeklyStats: {
        labels,
        data
      }
    });

  } catch (error) {
    console.error("[Backend] Stats Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get Restaurant Profile
router.get("/restaurant/profile", protect, async (req, res) => {
  try {
    console.log(`[Backend] GET /restaurant/profile HIT for User: ${req.user._id}`);
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.log(`[Backend] Restaurant not found for ID: ${req.user._id}`);
      return res.status(404).json({ message: "Restaurant not found" });
    }
    console.log(`[Backend] Returning profile for: ${user.email}`);
    res.json(user);
  } catch (error) {
    console.error("[Backend] GET /restaurant/profile ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update Restaurant Profile
// Update Restaurant Profile
import upload from "../middleware/uploadMiddleware.js"; // Import Middleware

router.put("/restaurant/profile", protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'restaurantImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, phone, address, cuisineType, isOpen } = req.body;
    let { profileImage, restaurantImage } = req.body; // Logic for existing/fallback string

    // Handle File Uploads
    if (req.files) {
      if (req.files.profileImage) {
        profileImage = req.files.profileImage[0].path;
      }
      if (req.files.restaurantImage) {
        restaurantImage = req.files.restaurantImage[0].path;
      }
    }

    try {
      const logMsg = `[${new Date().toISOString()}] PUT /restaurant/profile HIT\nUser: ${req.user._id}\nBody: ${JSON.stringify(req.body)}\nisOpen: ${isOpen} (${typeof isOpen})\n\n`;
      fs.appendFileSync('backend_debug.log', logMsg);
    } catch (err) { console.error("Log error", err); }

    console.log("PUT /restaurant/profile HIT");

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

    // Handle both images separately
    if (profileImage !== undefined) {
      console.log(`Updating profileImage: ${profileImage ? profileImage.substring(0, 20) + '...' : 'null'}`);
      user.profileImage = profileImage;
    }
    if (restaurantImage !== undefined) {
      console.log(`Updating restaurantImage: ${restaurantImage ? restaurantImage.substring(0, 20) + '...' : 'null'} (Length: ${restaurantImage ? restaurantImage.length : 0})`);
      user.restaurantImage = restaurantImage;
    }

    const updatedUser = await user.save();
    console.log(`User saved. restaurantImage in DB: ${!!updatedUser.restaurantImage}`);
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
 * 
 * MOVED TO: routes/foodRoutes.js
 * 
 */



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
// Update User Profile
router.put("/user/profile", protect, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.name && req.body.name.length > 100) return res.status(400).json({ message: "Name must be under 100 characters" });
    if (req.body.email && req.body.email.length > 254) return res.status(400).json({ message: "Email must be under 254 characters" });
    if (req.body.phone && req.body.phone.length > 20) return res.status(400).json({ message: "Phone must be under 20 characters" });

    // Check if new image uploaded
    if (req.file) {
      req.body.profileImage = req.file.path;
    } else if (req.body.profileImage && req.body.profileImage.length > 1048576) {
      // Allow keeping existing string URL, but check length if it's base64 (though we want to discourage base64)
      return res.status(400).json({ message: "Profile image URI is too long" });
    }

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
    const { label, street, city, state, pincode, landmark, isDefault, latitude, longitude } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    const shouldBeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({
      label, street, city, state, pincode, landmark, isDefault: shouldBeDefault, latitude, longitude
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
    console.log(`[Backend] GET /public/restaurants HIT`);
    console.log(`Query: ${JSON.stringify(req.query)}`);

    const { cuisine, isOpen, query, page = 1, limit = 20 } = req.query;
    let dbQuery = { role: { $in: ['user', 'restaurant'] } };

    if (cuisine) {
      dbQuery.cuisineType = { $regex: cuisine, $options: 'i' };
    }

    // Handle both boolean true and string 'true'
    if (isOpen === true || isOpen === 'true') {
      dbQuery.isOpen = true;
    }

    if (query) {
      dbQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { cuisineType: { $regex: query, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [restaurants, total] = await Promise.all([
      User.find(dbQuery)
        .select('-password -email -phone -addresses') // profileImage is allowed now as fallback
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for better performance
      User.countDocuments(dbQuery)
    ]);

    console.log(`[Backend] GET /public/restaurants`);
    console.log(`Query: ${JSON.stringify(req.query)}`);
    console.log(`DB Query: ${JSON.stringify(dbQuery)}`);
    console.log(`Found: ${restaurants.length} restaurants`);
    if (restaurants.length > 0) {
      console.log(`First User Role: ${restaurants[0].role}, Name: ${restaurants[0].name}`);
    }

    res.json({
      restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH (Public - Food Items OR Restaurants)
router.get("/public/search", async (req, res) => {
  try {
    const { query, type, tags, sortBy, dietary, minPrice, maxPrice } = req.query;
    let results = [];
    let dbQuery = {};

    if (type === 'food') {
      if (query) {
        dbQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ];
      }

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        const tagOrQuery = [
          { tags: { $in: tagList.map(t => new RegExp(t, 'i')) } },
          { category: { $in: tagList.map(t => new RegExp(t, 'i')) } }
        ];

        if (dbQuery.$or) {
          dbQuery.$and = [
            { $or: dbQuery.$or },
            { $or: tagOrQuery }
          ];
          delete dbQuery.$or;
        } else {
          dbQuery.$or = tagOrQuery;
        }
      }

      // Dietary Filter
      if (dietary === 'veg') {
        // Assuming 'Veg' category or tag indicates veg. 
        // Ideally we should have isVeg boolean on FoodItem. 
        // Based on mock data, let's use category/tags logic or check if 'veg' is in name/description if schema doesn't have explicit isVeg
        // Checking schema: It doesn't have isVeg. Let's rely on category or tags containing 'Veg'
        const vegRegex = /veg/i;
        const nonVegRegex = /non-veg/i; // simple check to exclude non-veg if we only want veg

        // This is a naive implementation; ideal is adding isVeg to schema. 
        // For now, let's enforce tags/category contains 'Veg'
        dbQuery.$and = dbQuery.$and || [];
        dbQuery.$and.push({
          $or: [
            { category: { $regex: vegRegex } },
            { tags: { $regex: vegRegex } },
            { name: { $regex: vegRegex } }
          ]
        });
        // Optimization: Exclude explicit non-veg if mixed
      }

      // Price Range Filter
      if (minPrice || maxPrice) {
        dbQuery.price = {};
        if (minPrice) dbQuery.price.$gte = Number(minPrice);
        if (maxPrice) dbQuery.price.$lte = Number(maxPrice);
      }

      let sortOptions = {};
      if (sortBy) {
        if (sortBy === 'price_asc') sortOptions.price = 1;
        else if (sortBy === 'price_desc') sortOptions.price = -1;
        // 'rating' and 'deliveryTime' not on FoodItem schema yet, ignoring
      }

      results = await FoodItem.find(dbQuery)
        .populate('restaurantId', 'name restaurantImage profileImage')
        .sort(sortOptions);

    } else {
      // RESTAURANT SEARCH
      dbQuery = { role: { $in: ['user', 'restaurant'] } };

      if (query) {
        dbQuery.$and = [
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { cuisineType: { $regex: query, $options: 'i' } }
            ]
          }
        ];
      }

      // Dietary Filter for Restaurants (e.g. Pure Veg)
      if (dietary === 'veg') {
        // Naive check: cuisineType contains "Veg"
        dbQuery.cuisineType = { $regex: /veg/i };
      }

      // Note: User model does not have price/rating for sorting yet.
      // We return results sorted by creation for now, unless we mock it or add fields.

      results = await User.find(dbQuery).select('-password -email -phone -addresses');
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public Search Endpoint
router.get("/public/search", async (req, res) => {
  try {
    const { query, type, dietary, sortBy } = req.query;
    if (!query) return res.json([]);

    const regex = new RegExp(query, "i");
    let results = [];

    // Search Restaurants
    if (!type || type === 'restaurant') {
      const restaurants = await User.find({
        role: "restaurant",
        $or: [{ name: regex }, { cuisineType: regex }]
      }).select("-password -otp -otpExpires -otpAttempts");

      results = [...results, ...restaurants];
    }

    // Search Food Items
    if (!type || type === 'food') {
      const foodQuery = {
        $or: [{ name: regex }, { description: regex }],
        isAvailable: true
      };

      if (dietary === 'veg') {
        foodQuery.isVeg = true;
      }

      const foods = await FoodItem.find(foodQuery).populate('restaurantId', 'name profileImage addresses');
      results = [...results, ...foods];
    }

    // Basic Sorting
    if (sortBy === 'rating') {
      results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    res.json(results);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

export default router;
