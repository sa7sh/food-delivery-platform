import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function fixUserRole() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to DB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const email = 'zoro@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User ${email} not found.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} | Role: ${user.role}`);

    if (user.role !== 'restaurant') {
      user.role = 'restaurant';
      await user.save();
      console.log(`✅ Updated role to 'restaurant' for ${email}`);
    } else {
      console.log(`Role is already 'restaurant'. No change needed.`);
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixUserRole();
