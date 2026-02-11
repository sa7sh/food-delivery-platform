import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

import User from "../models/User.js";
import Review from "../models/Review.js";

const migrateRatings = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");

    // Find all users with role 'restaurant'
    const restaurants = await User.find({ role: "restaurant" });
    console.log(`Found ${restaurants.length} restaurants.`);

    for (const restaurant of restaurants) {
      console.log(`Processing ${restaurant.name} (${restaurant._id})...`);

      // Find all reviews for this restaurant
      const reviews = await Review.find({
        restaurantId: restaurant._id,
        reviewType: "restaurant"
      });

      const totalReviews = reviews.length;
      let averageRating = 0;

      if (totalReviews > 0) {
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        averageRating = parseFloat((sum / totalReviews).toFixed(1));
      }

      // Update the restaurant document
      restaurant.averageRating = averageRating;
      restaurant.totalReviews = totalReviews;
      await restaurant.save();

      console.log(`Updated ${restaurant.name}: ${averageRating} stars (${totalReviews} reviews)`);
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateRatings();
