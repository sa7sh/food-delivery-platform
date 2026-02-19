import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import DeliveryPartner from "../models/DeliveryPartner.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
dotenv.config();
const router = express.Router();
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });
router.post('/api/auth/delivery/register', upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
    { name: 'rcImage', maxCount: 1 }
]), async (req, res) => {
    try {
        // REFIXED: Destructure the names exactly as sent from the Frontend
        const {
            name,
            phone,
            email,
            password,
            vehicle,
            aadhaarNumber,
            panNumber,
            bankName,
            accountNumber,
            ifscCode
        } = req.body;

        const existingPartner = await DeliveryPartner.findOne({ $or: [{ phone }, { email }] });
        if (existingPartner) {
            return res.status(400).json({ success: false, message: "Phone or Email already registered." });
        }

        // Hash Password if provided
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Capture file paths
        const aadhaarPath = req.files['aadhaarImage'] ? req.files['aadhaarImage'][0].path : null;
        const panPath = req.files['panImage'] ? req.files['panImage'][0].path : null;
        const rcPath = req.files['rcImage'] ? req.files['rcImage'][0].path : null;

        const newPartner = new DeliveryPartner({
            name,
            phone,
            email,
            password: hashedPassword,
            vehicle,
            aadhaarNumber,
            panNumber,
            bankName,
            accountNumber,
            ifscCode,
            aadhaarImage: aadhaarPath,
            panImage: panPath,
            rcImage: rcPath,
            status: 'pending'
        });

        const savedPartner = await newPartner.save();

        // Generate Token
        const token = jwt.sign(
            { id: savedPartner._id, role: 'delivery_partner' },
            process.env.JWT_SECRET || "temp_secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            success: true,
            message: "Application & Documents Received!",
            token,
            partner: savedPartner
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

router.post('/api/auth/delivery/login', async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        let partner;

        if (email && password) {
            // Email/Password Login
            partner = await DeliveryPartner.findOne({ email });
            if (!partner) return res.status(404).json({ success: false, message: "Account not found." });

            const isMatch = await bcrypt.compare(password, partner.password);
            if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials." });

        } else if (phone) {
            // Phone Legacy Login (or OTP in future)
            partner = await DeliveryPartner.findOne({ phone });
            if (!partner) return res.status(404).json({ success: false, message: "Account not found." });
        } else {
            return res.status(400).json({ success: false, message: "Please provide Email/Password or Phone." });
        }

        // Generate Token
        const token = jwt.sign(
            { id: partner._id, role: 'delivery_partner' },
            process.env.JWT_SECRET || "temp_secret",
            { expiresIn: "1d" }
        );

        res.status(200).json({ success: true, token, partner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;
