import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    }, // Toggle for Sold Out
    isVeg: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Indexes for fast searching and querying
foodItemSchema.index({ name: "text", category: "text" }); // Enables fast full-text search
foodItemSchema.index({ restaurantId: 1, isAvailable: 1 }); // Fast menu loading for restaurants

export default mongoose.model("FoodItem", foodItemSchema);
