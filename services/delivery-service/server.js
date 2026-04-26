import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import compression from "compression";

import deliveryPartnerRoutes from "./routes/deliveryPartnerRoutes.js";
import deliveryRatingRoutes from "./routes/deliveryRatingRoutes.js";
import deliveryAppAuthRoutes from "./routes/deliveryAppAuthRoutes.js";

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());

app.use("/api/delivery/partners", deliveryPartnerRoutes);
app.use("/api/delivery/ratings", deliveryRatingRoutes);

app.get("/", (req, res) => {
  res.send("Delivery Service Running");
});

app.get("/health", (req, res) => {
  res.json({ service: 'delivery-service', status: "running" });
});

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Delivery Service DB Connected"))
.catch(err=>console.log(err));

const PORT = 5004;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Delivery Service running on port ${PORT} (0.0.0.0)`);
});