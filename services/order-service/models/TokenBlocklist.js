import mongoose from "mongoose";

const tokenBlocklistSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }
});

export default mongoose.model("TokenBlocklist", tokenBlocklistSchema);
