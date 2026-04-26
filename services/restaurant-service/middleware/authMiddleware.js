import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlocklist from "../models/TokenBlocklist.js";

const protect = async (req, res, next) => {
  let token;

  console.log(`[AuthMiddleware] Processing request: ${req.method} ${req.originalUrl}`);
  console.log(`[AuthMiddleware] Headers Auth: ${req.headers.authorization ? 'PRESENT' : 'MISSING'}`);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(`[AuthMiddleware] Token extracted from headers: ${token ? 'YES' : 'NO'}`);
    } catch (error) {
      console.error(error);
    }
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log(`[AuthMiddleware] Token extracted from cookies`);
  }

  if (token) {
    try {
      // Check if token is blocked
      const isBlocked = await TokenBlocklist.findOne({ token });
      if (isBlocked) {
        console.log(`[AuthMiddleware] Token is blocked`);
        return res.status(401).json({ message: "Not authorized, token revoked" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
      console.log(`[AuthMiddleware] Token decoded. UserID: ${decoded.userId}`);

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        console.log(`[AuthMiddleware] User not found for ID: ${decoded.userId}`);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      console.log(`[AuthMiddleware] User authenticated: ${req.user._id}`);
      next();
    } catch (error) {
      console.error(`[AuthMiddleware] Token verification failed:`, error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log(`[AuthMiddleware] No token found`);
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect };

