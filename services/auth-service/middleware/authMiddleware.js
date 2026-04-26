import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";

const protect = async (req, res, next) => {
  let token;

  console.log(`[AuthMiddleware] Processing request: ${req.method} ${req.originalUrl}`);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log(`[AuthMiddleware] Token found in cookies`);
  }

  console.log(`[AuthMiddleware] Final Token: ${token ? (token.substring(0, 10) + '...') : 'NONE'}`);

  if (token) {
    try {
      // Check if token is blocked
      const isBlocked = await TokenBlocklist.findOne({ token });
      if (isBlocked) {
        return res.status(401).json({ message: "Not authorized, token revoked" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        console.warn(`[AuthMiddleware] User not found in DB for ID: ${decoded.userId}`);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log(`[AuthMiddleware] Auth successful for user: ${req.user.email}`);

      next();
    } catch (error) {
      console.error(`[AuthMiddleware] Token verification failed:`, error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect };
