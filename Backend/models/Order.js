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
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
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
      enum: ["COD", "Online", "Card", "UPI", "GPAY", "PHONEPE", "CARD"],
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
      enum: ["pending", "accepted", "preparing", "ready", "reached_restaurant", "order_picked", "out_for_delivery", "completed", "cancelled"],
      default: "pending",
    },
    timeline: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        description: { type: String },
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
