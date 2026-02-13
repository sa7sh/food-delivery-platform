import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Check if token is blocklisted
    const blocklisted = await TokenBlocklist.findOne({ token });
    if (blocklisted) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};
