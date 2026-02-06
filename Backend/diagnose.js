import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import FoodItem from './models/FoodItem.js';

dotenv.config();

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Check users
    console.log('=== USERS (RESTAURANTS) ===');
    const restaurants = await User.find({ role: { $in: ['user', 'restaurant'] } })
      .select('_id email name role cuisineType')
      .limit(5);
    console.log(`Total restaurants: ${restaurants.length}`);
    restaurants.forEach(r => {
      console.log(`- ${r.name || 'No Name'} (${r.email}) [Role: ${r.role}]`);
    });

    // Check food items
    console.log('\n=== FOOD ITEMS ===');
    const allFoods = await FoodItem.find().populate('restaurantId', 'name email');
    console.log(`Total food items: ${allFoods.length}`);

    if (allFoods.length > 0) {
      console.log('\nFood items by restaurant:');
      const foodsByRestaurant = {};
      allFoods.forEach(f => {
        const restId = f.restaurantId?._id?.toString() || 'Unknown';
        const restName = f.restaurantId?.name || f.restaurantId?.email || 'Unknown';
        if (!foodsByRestaurant[restId]) {
          foodsByRestaurant[restId] = { name: restName, count: 0, items: [] };
        }
        foodsByRestaurant[restId].count++;
        foodsByRestaurant[restId].items.push(f.name);
      });

      Object.entries(foodsByRestaurant).forEach(([id, data]) => {
        console.log(`\n${data.name}:`);
        console.log(`  Food items: ${data.count}`);
        data.items.slice(0, 3).forEach(item => console.log(`  - ${item}`));
        if (data.items.length > 3) console.log(`  ... and ${data.items.length - 3} more`);
      });
    } else {
      console.log('⚠️  NO FOOD ITEMS FOUND IN DATABASE');
    }

    // Check if any restaurant has food items
    console.log('\n=== DIAGNOSIS ===');
    if (restaurants.length === 0) {
      console.log('❌ No restaurants found');
    } else if (allFoods.length === 0) {
      console.log('❌ Restaurants exist but NO food items found');
      console.log('   → Restaurants need to add food items via the Restaurant App');
    } else {
      console.log('✅ Both restaurants and food items exist');
      console.log('   → Issue is likely in the frontend authentication or API call');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnose();
