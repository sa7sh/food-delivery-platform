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
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      maxlength: 50,
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    dietaryType: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "any"],
      default: "veg",
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FoodItem", foodItemSchema);
