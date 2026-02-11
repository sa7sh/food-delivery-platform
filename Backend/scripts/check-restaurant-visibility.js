import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models after dotenv is configured
const User = (await import('../models/User.js')).default;
const FoodItem = (await import('../models/FoodItem.js')).default;

async function checkRestaurantVisibility() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all restaurant accounts
    const restaurants = await User.find({
      role: { $in: ['user', 'restaurant'] }
    }).select('-password');

    console.log(`=== TOTAL RESTAURANTS: ${restaurants.length} ===\n`);

    for (const restaurant of restaurants) {
      console.log(`\n--- Restaurant: ${restaurant.name || 'NO NAME'} ---`);
      console.log(`ID: ${restaurant._id}`);
      console.log(`Email: ${restaurant.email}`);
      console.log(`Role: ${restaurant.role}`);
      console.log(`Cuisine Type: ${restaurant.cuisineType || 'NOT SET'}`);
      console.log(`Is Open: ${restaurant.isOpen}`);
      console.log(`Restaurant Image: ${restaurant.restaurantImage ? 'SET' : 'NOT SET'}`);
      console.log(`Profile Image: ${restaurant.profileImage ? 'SET' : 'NOT SET'}`);
      console.log(`Created At: ${restaurant.createdAt}`);

      // Check food items
      const foodItems = await FoodItem.find({ restaurantId: restaurant._id });
      console.log(`Food Items Count: ${foodItems.length}`);

      if (foodItems.length > 0) {
        console.log(`Sample Food Items:`);
        foodItems.slice(0, 3).forEach(item => {
          console.log(`  - ${item.name} (₹${item.price})`);
        });
      }

      // Check if this restaurant would be returned by the public endpoint
      const wouldBeVisible = restaurant.role === 'user' || restaurant.role === 'restaurant';
      console.log(`Would be visible in /public/restaurants: ${wouldBeVisible ? 'YES ✓' : 'NO ✗'}`);

      if (!wouldBeVisible) {
        console.log(`⚠️ ISSUE: Role is '${restaurant.role}', should be 'user' or 'restaurant'`);
      }

      if (foodItems.length === 0) {
        console.log(`⚠️ WARNING: No food items - restaurant will appear empty in customer app`);
      }

      if (!restaurant.name || restaurant.name.trim() === '') {
        console.log(`⚠️ ISSUE: No name set - will show as blank in customer app`);
      }

      if (!restaurant.cuisineType || restaurant.cuisineType.trim() === '') {
        console.log(`⚠️ WARNING: No cuisine type set`);
      }
    }

    console.log('\n\n=== SUMMARY ===');
    const visibleRestaurants = restaurants.filter(r =>
      r.role === 'user' || r.role === 'restaurant'
    );
    console.log(`Restaurants visible to customer app: ${visibleRestaurants.length}`);

    const restaurantsWithFood = [];
    for (const r of visibleRestaurants) {
      const count = await FoodItem.countDocuments({ restaurantId: r._id });
      if (count > 0) restaurantsWithFood.push(r);
    }
    console.log(`Restaurants with food items: ${restaurantsWithFood.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRestaurantVisibility();
