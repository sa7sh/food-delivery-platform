import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";
import sendEmail from "../utils/sendEmail.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;

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

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Normalize email
    const [localPart, domain] = email.split("@");
    const normalizedEmail = `${localPart.split("+")[0].trim().toLowerCase()}@${domain.trim().toLowerCase()}`;

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
      role: (role && ["user", "customer", "restaurant"].includes(role)) ? role : "user",
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "temp_secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "User registered", token, user: { _id: newUser._id, email: newUser.email, name: newUser.name, phone: newUser.phone, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [localPart, domain] = email.split("@");
    const normalizedEmail = `${localPart.split("+")[0].trim().toLowerCase()}@${domain.trim().toLowerCase()}`;

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
router.post("/logout", async (req, res) => {
  try {
    let token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

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

// SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 60 * 1000;
    user.otpAttempts = 0;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Your Login OTP",
      message: `Your OTP is ${otp}. It expires in 1 minute.`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 1 minute.</p>`
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+otp +otpExpires +otpAttempts");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpAttempts >= 5) return res.status(429).json({ message: "Too many failed attempts." });
    if (user.otpExpires < Date.now()) return res.status(400).json({ message: "OTP has expired" });
    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.` });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "temp_secret", { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, token, user: { _id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE ACCOUNT (Publicly reachable trigger, usually needs token check which is handled in original code)
router.delete("/delete-account", async (req, res) => {
  try {
    let token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(decoded.userId);
    await TokenBlocklist.create({ token });
    res.clearCookie("token");
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
router.post("/favorites/:id", protect, async (req, res) => {
  try {
    const restaurantId = req.params.id;
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

export default router;
