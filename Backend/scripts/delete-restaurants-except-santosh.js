import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FoodItem from '../models/FoodItem.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function deleteRestaurantsExceptSantosh() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!\n');

    // Find the Santosh restaurant account
    const santoshAccount = await User.findOne({
      name: { $regex: /santosh/i },
      role: { $in: ['restaurant', 'user'] }
    });

    if (!santoshAccount) {
      console.log('❌ Santosh restaurant account not found!');
      console.log('Please verify the account name and try again.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✓ Found Santosh account:');
    console.log(`  - ID: ${santoshAccount._id}`);
    console.log(`  - Name: ${santoshAccount.name}`);
    console.log(`  - Email: ${santoshAccount.email}`);
    console.log(`  - Role: ${santoshAccount.role}\n`);

    // Find all other restaurant accounts
    const restaurantsToDelete = await User.find({
      _id: { $ne: santoshAccount._id },
      role: { $in: ['restaurant', 'user'] }
    });

    console.log(`Found ${restaurantsToDelete.length} restaurant account(s) to delete:\n`);
    restaurantsToDelete.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name} (${restaurant.email})`);
    });

    if (restaurantsToDelete.length === 0) {
      console.log('\n✓ No other restaurant accounts to delete.');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\nDeleting associated data...\n');

    const restaurantIds = restaurantsToDelete.map(r => r._id);

    // Delete associated food items
    const deletedFoodItems = await FoodItem.deleteMany({
      restaurantId: { $in: restaurantIds }
    });
    console.log(`✓ Deleted ${deletedFoodItems.deletedCount} food items`);

    // Delete orders where these restaurants are the restaurant
    const deletedOrders = await Order.deleteMany({
      restaurantId: { $in: restaurantIds }
    });
    console.log(`✓ Deleted ${deletedOrders.deletedCount} orders`);

    // Delete reviews for these restaurants
    const deletedReviews = await Review.deleteMany({
      restaurantId: { $in: restaurantIds }
    });
    console.log(`✓ Deleted ${deletedReviews.deletedCount} reviews`);

    // Finally, delete the restaurant accounts
    const deletedRestaurants = await User.deleteMany({
      _id: { $in: restaurantIds }
    });
    console.log(`✓ Deleted ${deletedRestaurants.deletedCount} restaurant accounts\n`);

    console.log('✅ Cleanup completed successfully!');
    console.log(`\nRemaining restaurant account: ${santoshAccount.name} (${santoshAccount.email})`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

deleteRestaurantsExceptSantosh();
