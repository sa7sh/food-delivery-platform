// Test if restaurant has restaurantImage field
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkRestaurantImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    console.log('=== CHECKING RESTAURANT IMAGES ===');
    const restaurants = await User.find({ role: { $in: ['user', 'restaurant'] } })
      .select('_id email name profileImage restaurantImage')
      .limit(10);

    console.log(`Total restaurants: ${restaurants.length}\n`);

    restaurants.forEach(r => {
      console.log(`Restaurant: ${r.name || 'No Name'} (${r.email})`);
      console.log(`  Profile Image: ${r.profileImage ? 'YES (' + r.profileImage.substring(0, 50) + '...)' : 'NO'}`);
      console.log(`  Restaurant Image: ${r.restaurantImage ? 'YES (' + r.restaurantImage.substring(0, 50) + '...)' : 'NO'}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRestaurantImages();
