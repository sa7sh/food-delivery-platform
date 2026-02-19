import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);

    console.log(`Found ${orders.length} recent orders.`);

    orders.forEach(order => {
      console.log(`Order ID: ${order._id} | Status: '${order.status}' | Restaurant: ${order.restaurantId} | Customer: ${order.customerId}`);
    });

    const readyOrders = await Order.find({ status: "ready" });
    console.log(`\nSpecific query for { status: "ready" } found ${readyOrders.length} orders.`);

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkOrders();
