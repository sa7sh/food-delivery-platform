// More detailed test
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function detailedCheck() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Find the specific restaurant that should have an image
    const rohan = await User.findOne({ email: 'rohan@gmail.com' });

    if (rohan) {
      console.log('=== ROHAN RESTAURANT ===');
      console.log('Name:', rohan.name);
      console.log('Email:', rohan.email);
      console.log('Role:', rohan.role);
      console.log('Profile Image exists:', !!rohan.profileImage);
      console.log('Restaurant Image exists:', !!rohan.restaurantImage);

      if (rohan.restaurantImage) {
        console.log('Restaurant Image preview:', rohan.restaurantImage.substring(0, 100) + '...');
      }
    } else {
      console.log('Rohan not found');
    }

    // Now test the API query
    console.log('\n=== API QUERY TEST ===');
    const restaurants = await User.find({ role: { $in: ['user', 'restaurant'] } })
      .select('-password -email -phone -addresses -profileImage')
      .limit(5);

    console.log(`Found ${restaurants.length} restaurants`);
    restaurants.forEach(r => {
      console.log(`\n${r.name || 'No Name'}`);
      console.log('  Has restaurantImage:', !!r.restaurantImage);
      if (r.restaurantImage) {
        console.log('  Image preview:', r.restaurantImage.substring(0, 50) + '...');
      }
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

detailedCheck();
