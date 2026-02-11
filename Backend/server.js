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

// Load env variables
dotenv.config();

// 1️⃣ Create Express App FIRST
// ===============================
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow everyone for now
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

// Store io instance in app to use in routes
app.set("socketio", io);

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

// Food routes (used by ALL apps)
app.use("/api/foods", foodRoutes);

// Order routes
import orderRoutes from "./routes/orderRoutes.js";
app.use("/api/orders", orderRoutes);

// Review routes
import reviewRoutes from "./routes/reviewRoutes.js";
app.use("/api/reviews", reviewRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

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
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

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
