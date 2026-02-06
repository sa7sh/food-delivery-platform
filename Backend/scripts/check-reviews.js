import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function checkReviews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!\n');

    const db = mongoose.connection.db;
    const reviewsCollection = db.collection('reviews');

    // Fetch all reviews
    const allReviews = await reviewsCollection.find({}).sort({ createdAt: -1 }).toArray();

    console.log(`📊 Total Reviews in Database: ${allReviews.length}\n`);

    if (allReviews.length === 0) {
      console.log('No reviews found in the database.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Group by type
    const restaurantReviews = allReviews.filter(r => r.reviewType === 'restaurant');
    const foodItemReviews = allReviews.filter(r => r.reviewType === 'food_item');

    console.log(`🍽️  Restaurant Reviews: ${restaurantReviews.length}`);
    console.log(`🍔 Food Item Reviews: ${foodItemReviews.length}\n`);

    console.log('='.repeat(80));
    console.log('RESTAURANT REVIEWS');
    console.log('='.repeat(80));

    restaurantReviews.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review._id}`);
      console.log(`   Customer ID: ${review.customerId}`);
      console.log(`   Restaurant ID: ${review.restaurantId}`);
      console.log(`   Order ID: ${review.orderId}`);
      console.log(`   Rating: ${'⭐'.repeat(review.rating)} (${review.rating}/5)`);
      console.log(`   Comment: "${review.comment || 'No comment'}"`);
      console.log(`   Date: ${new Date(review.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('FOOD ITEM REVIEWS');
    console.log('='.repeat(80));

    foodItemReviews.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review._id}`);
      console.log(`   Customer ID: ${review.customerId}`);
      console.log(`   Restaurant ID: ${review.restaurantId}`);
      console.log(`   Food Item ID: ${review.foodItemId}`);
      console.log(`   Order ID: ${review.orderId}`);
      console.log(`   Rating: ${'⭐'.repeat(review.rating)} (${review.rating}/5)`);
      console.log(`   Comment: "${review.comment || 'No comment'}"`);
      console.log(`   Date: ${new Date(review.createdAt).toLocaleString()}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Review check completed!');
    console.log('='.repeat(80));

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking reviews:', error);
    process.exit(1);
  }
}

checkReviews();
