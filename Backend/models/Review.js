import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewType: {
      type: String,
      enum: ["restaurant", "food_item"],
      required: true,
      default: "restaurant",
    },
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      required: false, // Only required for food_item reviews
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      maxlength: 500,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
reviewSchema.index({ restaurantId: 1, reviewType: 1 });
reviewSchema.index({ foodItemId: 1 });


// Ensure one restaurant review per order
reviewSchema.index(
  { orderId: 1, reviewType: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: "restaurant" }
  }
);

// Ensure one review per food item per order
reviewSchema.index(
  { orderId: 1, foodItemId: 1 },
  {
    unique: true,
    partialFilterExpression: { reviewType: "food_item" }
  }
);

export default mongoose.model("Review", reviewSchema);
