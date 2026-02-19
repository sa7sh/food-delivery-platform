import mongoose from "mongoose";

const DeliveryPartnerSchema = new mongoose.Schema({
  // Step 1: Basic Info
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true }, // Added email
  password: { type: String }, // Added password
  vehicle: { type: String, required: true },

  // Step 2: Verification
  aadhaarNumber: { type: String, required: true },
  panNumber: { type: String, required: true },

  // Storage for local file paths or Cloudinary URLs
  aadhaarImage: { type: String, default: "" },
  panImage: { type: String, default: "" },
  rcImage: { type: String, default: "" }, // Added this for the RC Card

  // Step 3: Payout Details
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },

  // Professional Metadata
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  role: { type: String, default: 'delivery_guy' }, // Added role for easy identification
  isOnline: { type: Boolean, default: false }, // Useful for the dashboard later
  ratings: [{
    rating: Number,
    review: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 5.0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DeliveryPartner', DeliveryPartnerSchema);