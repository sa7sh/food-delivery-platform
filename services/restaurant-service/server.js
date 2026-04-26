import express from "express"
import mongoose from "mongoose"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
import compression from "compression";

console.log(`[RestaurantService] CWD: ${process.cwd()}`);
console.log(`[RestaurantService] .env exists: ${fs.existsSync('.env')}`);

import restaurantRoutes from "./routes/restaurantRoutes.js"
import foodRoutes from "./routes/foodRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"

import { connectRedis } from "./config/redis.js"

// Connect to Redis
connectRedis().catch(err => console.error("Redis Connection Failed:", err));

const app = express()

app.use(compression());
app.use(cors());
app.use(express.json())

app.use("/api/restaurants", restaurantRoutes)
app.use("/api/foods", foodRoutes)
app.use("/api/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.send("Restaurant Service Running")
})

app.get("/health", (req, res) => {
  res.json({ service: 'restaurant-service', status: "running" })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")

    app.listen(5002, "0.0.0.0", () => {
      console.log("Restaurant Service running on port 5002 (0.0.0.0)")
    })
  })
  .catch(err => console.log(err))