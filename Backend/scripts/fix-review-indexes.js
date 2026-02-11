import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function fixReviewIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!');

    const db = mongoose.connection.db;
    const reviewsCollection = db.collection('reviews');

    // List all indexes
    console.log('\nCurrent indexes on reviews collection:');
    const indexes = await reviewsCollection.indexes();
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index));
    });

    // Drop the problematic orderId_1 index if it exists
    try {
      console.log('\nAttempting to drop orderId_1 index...');
      await reviewsCollection.dropIndex('orderId_1');
      console.log('✓ Successfully dropped orderId_1 index');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('✓ orderId_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // List indexes after cleanup
    console.log('\nIndexes after cleanup:');
    const newIndexes = await reviewsCollection.indexes();
    newIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index));
    });

    console.log('\n✓ Review indexes fixed successfully!');
    console.log('\nThe following indexes should now be present:');
    console.log('  - _id_ (default)');
    console.log('  - restaurantId_1_reviewType_1');
    console.log('  - foodItemId_1');
    console.log('  - orderId_1_reviewType_1');
    console.log('  - orderId_1_reviewType_1 (unique, partial: reviewType="restaurant")');
    console.log('  - orderId_1_foodItemId_1 (unique, partial: reviewType="food_item")');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing review indexes:', error);
    process.exit(1);
  }
}

fixReviewIndexes();
