import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = (await import('../models/User.js')).default;

async function checkRecentUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find last 5 users
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('=== LAST 5 USERS ===');
    users.forEach(u => {
      console.log(`ID: ${u._id}`);
      console.log(`Name: ${u.name}`);
      console.log(`Email: ${u.email}`);
      console.log(`Role: '${u.role}'`); // Quote to see whitespace
      console.log(`Created: ${u.createdAt}`);
      console.log('-------------------');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRecentUsers();
