import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import DeliveryPartner from "../models/DeliveryPartner.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
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
// Send OTP for delivery partner
router.post('/api/auth/delivery/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const normalizedEmail = email.toLowerCase().trim();
        const partner = await DeliveryPartner.findOne({ email: normalizedEmail });
        if (!partner) return res.status(404).json({ success: false, message: "Account not found." });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        partner.otp = otp;
        partner.otpExpires = otpExpires;
        partner.otpAttempts = 0;
        await partner.save();

        console.log(`[Backend] Delivery Partner OTP for ${email}: ${otp}`);

        try {
            await sendEmail({
                email: partner.email,
                subject: "Treato Go - Delivery Partner Login OTP",
                message: `Your OTP is ${otp}. It expires in 5 minutes.`,
                html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
            });
        } catch (emailError) {
            console.error("Email send failed:", emailError);
            return res.status(500).json({ success: false, message: "Failed to send email" });
        }

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify OTP & Login for delivery partner
router.post('/api/auth/delivery/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

        const normalizedEmail = email.toLowerCase().trim();
        const partner = await DeliveryPartner.findOne({ email: normalizedEmail }).select("+otp +otpExpires +otpAttempts");

        if (!partner) return res.status(404).json({ success: false, message: "Account not found." });

        if (partner.otpAttempts >= 5) return res.status(429).json({ success: false, message: "Too many failed attempts." });

        if (partner.otpExpires < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired." });

        if (partner.otp !== otp) {
            partner.otpAttempts += 1;
            await partner.save();
            return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - partner.otpAttempts} attempts remaining.` });
        }

        // Success - clear OTP
        partner.otp = undefined;
        partner.otpExpires = undefined;
        partner.otpAttempts = 0;
        await partner.save();

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
