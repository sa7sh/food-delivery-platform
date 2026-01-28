console.log("authRoutes loaded");

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";

const router = express.Router();

/**
 * TEMP REGISTER (needed only to test login)
 */
router.post("/register", async (req, res) => {
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

    // Normalize email: trim, lowercase, and remove plus-addressing
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

    // Generate Token immediately for registration login
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "temp_secret",
      { expiresIn: "1d" }
    );

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Return user data without password
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

/**
 * LOGIN ROUTE (THIS IS THE MAIN ONE)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

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

    // Normalize email
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

    // Set Cookie
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

/**
 * LOGOUT ROUTE (Invalidate Token)
 */
router.post("/logout", async (req, res) => {
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

/**
 * DELETE ACCOUNT ROUTE
 * Permanently deletes the user account and all associated data
 */
router.delete("/delete-account", async (req, res) => {
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

    // Find and delete user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user from database
    await User.findByIdAndDelete(userId);

    // Add token to blocklist
    await TokenBlocklist.create({ token });

    // Clear cookie
    res.clearCookie("token");

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
