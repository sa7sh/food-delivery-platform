import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to DB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // Find user by email 'zoro@gmail.com' specifically
    const user = await User.findOne({ email: 'zoro@gmail.com' });

    if (user) {
      console.log('\n=== USER DETAILS ===');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: '${user.role}'`);
      console.log(`Restaurant Image: ${user.restaurantImage ? 'SET' : 'NULL'}`);
      console.log(`Profile Image: ${user.profileImage ? 'SET' : 'NULL'}`);
      if (user.restaurantImage) console.log(`Restaurant Image URL: ${user.restaurantImage.substring(0, 50)}...`);
      if (user.profileImage) console.log(`Profile Image URL: ${user.profileImage.substring(0, 50)}...`);
      console.log(`ID: ${user._id}`);
    } else {
      console.log('User zoro@gmail.com not found.');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkUsers();
