import mongoose from "mongoose";

const tokenBlocklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// Automatically delete tokens after 24 hours (86400 seconds)
// This should match your JWT expiry time
tokenBlocklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("TokenBlocklist", tokenBlocklistSchema);
