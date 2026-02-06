import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodItem from './models/FoodItem.js';

dotenv.config();

async function checkFoodItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    console.log('=== CHECKING FOOD ITEMS ===');
    const foods = await FoodItem.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Checking latest ${foods.length} items:\n`);

    foods.forEach(f => {
      console.log(`Food: ${f.name}`);
      console.log(`  ID: ${f._id}`);
      console.log(`  RestaurantID: ${f.restaurantId}`);
      console.log(`  ImageURL Length: ${f.imageUrl ? f.imageUrl.length : 0}`);
      console.log(`  ImageURL Start: ${f.imageUrl ? f.imageUrl.substring(0, 50) + '...' : 'NULL'}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFoodItems();
