import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodItem from '../models/FoodItem.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateDietaryFields = async () => {
  try {
    console.log('\n🔄 Starting migration for dietary and price range fields...\n');

    const foods = await FoodItem.find({});
    console.log(`📊 Found ${foods.length} food items to migrate\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const food of foods) {
      let needsUpdate = false;
      const originalDietary = food.dietaryType;
      const originalPriceRange = food.priceRange;

      console.log(`Checking item: ${food.name} (isVeg: ${food.isVeg}, price: ${food.price})`);

      // 1. Determine correct dietary type based on isVeg
      // We force update because schema default might be wrong (e.g., 'veg' for a non-veg item)
      const correctDietary = food.isVeg ? 'veg' : 'non-veg';

      if (food.dietaryType !== correctDietary) {
        console.log(` -> Updating dietaryType: ${food.dietaryType} => ${correctDietary}`);
        food.dietaryType = correctDietary;
        needsUpdate = true;
      }

      // 2. Determine correct price range (Rupees)
      // $    < 200
      // $$   200 - 500
      // $$$  500 - 1000
      // $$$$ > 1000
      let correctPriceRange = '$$$$';
      if (food.price < 200) {
        correctPriceRange = '$';
      } else if (food.price < 500) {
        correctPriceRange = '$$';
      } else if (food.price < 1000) {
        correctPriceRange = '$$$';
      }

      if (food.priceRange !== correctPriceRange) {
        console.log(` -> Updating priceRange: ${food.priceRange} => ${correctPriceRange}`);
        food.priceRange = correctPriceRange;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await food.save();
        updatedCount++;
        console.log(`✓ Saved: ${food.name}`);
      } else {
        console.log(` - No changes for: ${food.name}`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Updated: ${updatedCount} items`);
    console.log(`   - Skipped: ${skippedCount} items (already migrated)\n`);
  } catch (error) {
    console.error('✗ Migration error:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    await migrateDietaryFields();
    console.log('🎉 All done! Exiting...\n');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
};

runMigration();
