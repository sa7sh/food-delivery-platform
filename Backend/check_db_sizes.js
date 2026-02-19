import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import User from './models/User.js';
import FoodItem from './models/FoodItem.js';

dotenv.config();

const checkSizes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Check Order Sizes
    const orders = await Order.find({})
      .populate("restaurantId", "name profileImage restaurantImage")
      .populate({ path: "items.foodId", select: "image name" })
      .lean();

    const fs = await import('fs');
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    log(`Checking ${orders.length} orders...`);

    let maxBytes = 0;
    let totalBytes = 0;

    let totalSanitizedBytes = 0;

    orders.forEach((order, index) => {
      const originalJson = JSON.stringify(order);
      const originalSize = Buffer.byteLength(originalJson, 'utf8');

      // Simulate Sanitization
      const sanitizedOrder = JSON.parse(originalJson);
      if (sanitizedOrder.restaurantId) {
        if (sanitizedOrder.restaurantId.restaurantImage?.startsWith('data:image') && sanitizedOrder.restaurantId.restaurantImage.length > 500) sanitizedOrder.restaurantId.restaurantImage = null;
        if (sanitizedOrder.restaurantId.profileImage?.startsWith('data:image') && sanitizedOrder.restaurantId.profileImage.length > 500) sanitizedOrder.restaurantId.profileImage = null;
      }
      if (sanitizedOrder.items) {
        sanitizedOrder.items.forEach(item => {
          if (item.foodId?.image?.startsWith('data:image') && item.foodId.image.length > 500) item.foodId.image = null;
          if (item.image?.startsWith('data:image') && item.image.length > 500) item.image = null;
        });
      }

      const sanitizedJson = JSON.stringify(sanitizedOrder);
      const sanitizedSize = Buffer.byteLength(sanitizedJson, 'utf8');

      totalBytes += originalSize;
      totalSanitizedBytes += sanitizedSize;

      if (originalSize > maxBytes) maxBytes = originalSize;

      if (originalSize > 100000) { // Log large orders (>100KB)
        log(`Order ${order._id} Size: ${(originalSize / 1024).toFixed(2)} KB -> Sanitized: ${(sanitizedSize / 1024).toFixed(2)} KB`);
      }
    });

    log(`Average Order Size: ${(totalBytes / orders.length / 1024).toFixed(2)} KB`);
    log(`Average Sanitized Size: ${(totalSanitizedBytes / orders.length / 1024).toFixed(2)} KB`);
    log(`Total Bandwidth Saved (for ${orders.length} orders): ${((totalBytes - totalSanitizedBytes) / 1024 / 1024).toFixed(2)} MB`);

    fs.writeFileSync('db_analysis.txt', output);


    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkSizes();
