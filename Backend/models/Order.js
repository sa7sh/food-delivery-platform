import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: false },
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        foodId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" }, // Optional link
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }, // Snapshot of image URL
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "Card", "UPI"],
      default: "COD",
    },
    isDeletedByRestaurant: {
      type: Boolean,
      default: false,
    },
    restaurantReviewed: {
      type: Boolean,
      default: false,
    },
    itemsReviewed: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
    }],
    status: {
      type: String,
      enum: ["pending", "accepted", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
