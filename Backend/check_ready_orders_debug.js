import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const readyOrders = await Order.find({ status: "ready" });
    console.log(`\nTotal 'ready' orders: ${readyOrders.length}`);

    const availableOrders = await Order.find({ status: "ready", deliveryPartnerId: null });
    console.log(`Available (no partner assigned) 'ready' orders: ${availableOrders.length}`);

    if (availableOrders.length > 0) {
      console.log("\nSample Available Order:");
      console.log(JSON.stringify(availableOrders[0], null, 2));
    } else {
      console.log("\nNo orders are currently available for delivery partners.");

      // Check for other statuses
      const allOrders = await Order.find({});
      const statusCounts = {};
      allOrders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      console.log("\nOrder Status Counts:", statusCounts);
    }

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkOrders();
