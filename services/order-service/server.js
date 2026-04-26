import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import compression from "compression";

import customerOrderRoutes from "./routes/customerOrderRoutes.js";
import restaurantOrderRoutes from "./routes/restaurantOrderRoutes.js";
import deliveryOrderRoutes from "./routes/deliveryOrderRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

// Import models to ensure they are registered with Mongoose
import "./models/User.js";
import "./models/FoodItem.js";
import "./models/DeliveryPartner.js";

import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketService } from "./socket/socketService.js";
import { SOCKET_EVENTS } from "./socket/socketEvents.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 30000,
  pingInterval: 10000,
  transports: ['websocket'],
  perMessageDeflate: {
    threshold: 1024,
  },
});

// Initialize Socket Service
initSocketService(io);

io.on("connection", (socket) => {
  console.log(`[OrderService] New Socket Connection: ${socket.id}`);

  socket.on(SOCKET_EVENTS.JOIN_RESTAURANT_ROOM, (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`[OrderService] Socket ${socket.id} joined restaurant_${restaurantId}`);
  });

  socket.on(SOCKET_EVENTS.JOIN_CUSTOMER_ROOM, (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`[OrderService] Socket ${socket.id} joined customer_${customerId}`);
  });

  socket.on(SOCKET_EVENTS.JOIN_DELIVERY_ROOM, () => {
    socket.join("delivery_partners");
    console.log(`[OrderService] Socket ${socket.id} joined delivery_partners`);
  });

  socket.on("disconnect", () => {
    console.log(`[OrderService] Socket Disconnected: ${socket.id}`);
  });
});

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Debug Logger
app.use((req, res, next) => {
  console.log(`[OrderService] Incoming: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/orders/customer", customerOrderRoutes);
app.use("/api/orders/restaurant", restaurantOrderRoutes);
app.use("/api/orders/delivery", deliveryOrderRoutes);

app.get("/health", (req, res) => {
  res.json({ service: 'order-service', status: "running" });
});

// Error Handler
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Order Service DB Connected");
})
.catch(err => {
    console.log("Order Service DB Connection Error:", err);
});

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT} (including Socket.io)`);
});