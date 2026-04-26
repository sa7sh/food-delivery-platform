import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import compression from "compression";

console.log(`[AuthService] CWD: ${process.cwd()}`);
console.log(`[AuthService] .env exists: ${fs.existsSync('.env')}`);

import authRoutes from "./routes/authRoutes.js";

import deliveryAppAuthRoutes from "./routes/deliveryAppAuthRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth/delivery", deliveryAppAuthRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/auth", authRoutes);

// Debug: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ service: 'auth-service', status: "running" });
});

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5001, "0.0.0.0", () => {
      console.log("Auth Service running on port 5001 (listening on 0.0.0.0)");
    });
  })
  .catch((err) => console.log(err));