import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Routes
import apiRoutes from "./routes/apiRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import deliveryAppAuthRoutes from "./routes/deliveryAppAuthRoutes.js";
import deliveryPartnerRoutes from "./routes/deliveryPartnerRoutes.js";
import deliveryRatingRoutes from "./routes/deliveryRatingRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { initSocketService } from "./services/socketService.js";

// Load env variables
dotenv.config();

// 1️⃣ Create Express App FIRST
// ===============================
import { createServer } from "http";
import { Server } from "socket.io";
import setupCronJobs from "./cronJobs.js";

const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Store io instance in app to use in routes (backward compat for unmigrated handlers)
app.set("socketio", io);

// Initialize socket service — must happen before any route handler fires
initSocketService(io);

// Check DB Connection
// checkDbConnection();

// Start Scheduled Jobs
setupCronJobs();

// Socket Connection Handler
io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Join Restaurant Room
  socket.on("joinRestaurantRoom", (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant_${restaurantId}`);
  });

  // Join Customer Room
  socket.on("joinCustomerRoom", (userId) => {
    socket.join(`customer_${userId}`);
    console.log(`Socket ${socket.id} joined customer_${userId}`);
  });

  // Join Delivery Room
  socket.on("joinDeliveryRoom", () => {
    socket.join("delivery_partners");
    console.log(`Socket ${socket.id} joined delivery_partners`);
  });

  socket.on("disconnect", () => {
    console.log("Socket Disconnected");
  });
});

console.log("Starting server...");

// ===============================
// 2️⃣ Global Middlewares
// ===============================
app.use(
  cors({
    origin: "*", // allow all origins for now (dev)
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Cloudinary is used now, no need for static uploads serving


// ===============================
// 3️⃣ Rate Limiter (Auth Only)
// ===============================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===============================
// 4️⃣ Routes (AFTER app creation)
// ===============================

// Other API routes (MUST come before auth routes to avoid interception)
app.use("/api", apiRoutes);

// Auth routes (with limiter) - more specific path
app.use("/api/auth", authLimiter, apiRoutes);

// Delivery Partner Auth
app.use(deliveryAppAuthRoutes);

// Food routes (used by ALL apps)
app.use("/api/foods", foodRoutes);

// Order routes
import orderRoutes from "./routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

// Review routes
import reviewRoutes from "./routes/reviewRoutes.js";
app.use("/api/reviews", reviewRoutes);

// Analytics routes
// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// Driver / Delivery Partner Routes
app.use("/api/driver", deliveryPartnerRoutes);
app.use("/api/delivery-rating", deliveryRatingRoutes);

// ===============================
// 5️⃣ Test Routes
// ===============================
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/test", (req, res) => {
  res.send("Backend working");
});

// ===============================
// 6️⃣ Global Error Handler
// ===============================
// Must be registered AFTER all routes. Handles AppError, Mongoose errors,
// JWT errors, and JSON parse errors with a consistent { success, message } shape.
app.use(errorHandler);

// ===============================
// 7️⃣ Database Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// 8️⃣ Start Server
// ===============================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend accessible at http://localhost:${PORT}`);
});
