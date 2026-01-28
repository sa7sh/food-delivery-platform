import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import restaurantRoutes from "./routes/restaurantRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

console.log("Starting server...");

dotenv.config();

const app = express(); // ✅ app is created FIRST

// middlewares
app.use(cors({
  origin: "*", // Allow ALL origins for debugging
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Rate Limiter for Auth Routes
// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit: 20 requests per 15 min to prevent brute force
  message: { message: "Too many login attempts, please try again later." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// routes (AFTER app is created)
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle Malformed JSON (SyntaxError)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend accessible at http://192.168.29.228:${PORT}`);
});
