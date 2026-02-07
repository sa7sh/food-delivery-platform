import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FoodItem from '../models/FoodItem.js';

// Load env variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const uploadToCloudinary = async (base64String, folder) => {
  try {
    if (!base64String || !base64String.startsWith('data:image')) {
      return null;
    }

    // Upload
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    return null; // Return null on failure to avoid data loss, logic will skip update
  }
};

const migrateFoodItems = async () => {
  console.log("--- Migrating Food Items ---");
  const foods = await FoodItem.find({});
  let count = 0;

  for (const food of foods) {
    let modified = false;

    if (food.imageUrl && food.imageUrl.startsWith('data:image')) {
      console.log(`Uploading image for food: ${food.name}`);
      const newUrl = await uploadToCloudinary(food.imageUrl, 'food-delivery-app/foods');
      if (newUrl) {
        food.imageUrl = newUrl;
        modified = true;
      }
    }

    if (modified) {
      await food.save();
      count++;
      console.log(`Updated food: ${food.name}`);
    }
  }
  console.log(`Migrated ${count} Food Items.`);
};

const migrateUsers = async () => {
  console.log("--- Migrating Users (Restaurants/Customers) ---");
  const users = await User.find({});
  let count = 0;

  for (const user of users) {
    let modified = false;

    // Profile Image
    if (user.profileImage && user.profileImage.startsWith('data:image')) {
      console.log(`Uploading profile image for user: ${user.name}`);
      const newUrl = await uploadToCloudinary(user.profileImage, 'food-delivery-app/profiles');
      if (newUrl) {
        user.profileImage = newUrl;
        modified = true;
      }
    }

    // Restaurant Image
    if (user.restaurantImage && user.restaurantImage.startsWith('data:image')) {
      console.log(`Uploading restaurant image for user: ${user.name}`);
      const newUrl = await uploadToCloudinary(user.restaurantImage, 'food-delivery-app/restaurants');
      if (newUrl) {
        user.restaurantImage = newUrl;
        modified = true;
      }
    }

    if (modified) {
      await user.save();
      count++;
      console.log(`Updated user: ${user.name}`);
    }
  }
  console.log(`Migrated ${count} Users.`);
};

const runMigration = async () => {
  await connectDB();
  await migrateUsers();
  await migrateFoodItems();
  console.log("--- MIGRATION COMPLETE ---");
  process.exit(0);
};

runMigration();
