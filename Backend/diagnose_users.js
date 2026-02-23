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

    const users = await User.find({}, 'email name role');
    console.log('All Users:');
    users.forEach(u => {
      console.log(`- Email: "${u.email}" | Name: "${u.name}" | Role: "${u.role}"`);
    });

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkUsers();
