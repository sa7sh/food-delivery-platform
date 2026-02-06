
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const verifyRestaurant = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const restaurants = await User.find({
      role: { $in: ["user", "restaurant", "admin"] } // Check all potential roles
    }).select("name email role isOpen isActive addresses");

    console.log(`Found ${restaurants.length} users/restaurants:`);
    restaurants.forEach(r => {
      console.log(`- ${r.name} (${r.email}) | Role: ${r.role} | Open: ${r.isOpen}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

verifyRestaurant();
