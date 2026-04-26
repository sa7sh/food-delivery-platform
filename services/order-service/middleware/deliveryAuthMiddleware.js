import jwt from "jsonwebtoken";
import DeliveryPartner from "../models/DeliveryPartner.js";

const protectDelivery = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");

        if (decoded.role !== "delivery_partner") {
            return res.status(403).json({ message: "Not authorized, requires delivery partner role" });
        }

        req.partner = await DeliveryPartner.findById(decoded.id).select("-password");

        if (!req.partner) {
            return res.status(401).json({ message: "Not authorized, partner not found" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export { protectDelivery };
