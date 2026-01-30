import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Routes
import apiRoutes from "./routes/apiRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";

// Load env variables
dotenv.config();

// ===============================
// 1️⃣ Create Express App FIRST
// ===============================
const app = express();

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

// ===============================
// 8️⃣ Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend accessible at http://localhost:${PORT}`);
});
