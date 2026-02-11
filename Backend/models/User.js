import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
      maxlength: 100,
    },
    phone: {
      type: String,
      default: "",
      maxlength: 20,
    },
    addresses: [
      {
        label: { type: String, required: true }, // e.g., Home, Work
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        isDefault: { type: Boolean, default: false },
      }
    ],
    cuisineType: {
      type: String,
      default: "",
      maxlength: 100,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    restaurantImage: {
      type: String,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "customer", "restaurant"],
    },
    // OTP Fields
    otp: {
      type: String,
      select: false, // Don't return by default
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References other Users (Restaurants)
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
