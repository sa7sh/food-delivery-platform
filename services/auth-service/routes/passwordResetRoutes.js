import express from "express";
import User from "../models/User.js";
import DeliveryPartner from "../models/DeliveryPartner.js";
import { generateNumericOTP, hashOTP, verifyOTP } from "../utils/otpUtils.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Helper to find user in either collection
const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail }).select("+resetPasswordOtp +resetPasswordOtpExpiry +isOtpVerified");
  if (user) {
    const type = user.role === 'restaurant' ? 'Restaurant Partner' : 'Customer';
    return { user, type, model: User };
  }

  let dp = await DeliveryPartner.findOne({ email: normalizedEmail }).select("+resetPasswordOtp +resetPasswordOtpExpiry +isOtpVerified");
  if (dp) return { user: dp, type: 'Delivery Partner', model: DeliveryPartner };

  return null;
};

// Forgot Password -> Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const found = await findUserByEmail(email);
    // Always return success even if not found to prevent enumeration
    if (!found) {
      return res.json({ success: true, message: "If the email is registered, an OTP has been sent." });
    }

    const { user, type } = found;

    // Generate and hash OTP
    const otp = generateNumericOTP();
    const hashedOtp = await hashOTP(otp);
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpiry = expiry;
    user.isOtpVerified = false;
    await user.save();

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #9139BA;">Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>You have requested to reset your password for your <strong>${type}</strong> account.</p>
        <p>Your 6-digit verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP",
      html: htmlTemplate,
    });

    res.json({ success: true, message: "If the email is registered, an OTP has been sent." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "An error occurred during password reset request." });
  }
});

// Verify OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const found = await findUserByEmail(email);
    if (!found) return res.status(400).json({ success: false, message: "Invalid email or OTP." });

    const { user } = found;

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
      return res.status(400).json({ success: false, message: "No OTP request found for this email." });
    }

    if (user.resetPasswordOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await verifyOTP(otp, user.resetPasswordOtp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    user.isOtpVerified = true;
    await user.save();

    res.json({ success: true, message: "OTP verified successfully. You may now reset your password." });

  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    res.status(500).json({ success: false, message: "An error occurred during OTP verification." });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and new password are required" });

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const found = await findUserByEmail(email);
    if (!found) return res.status(400).json({ success: false, message: "Invalid request." });

    const { user } = found;

    if (!user.isOtpVerified) {
      return res.status(400).json({ success: false, message: "OTP verification is required before resetting password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    user.isOtpVerified = false;

    await user.save();

    res.json({ success: true, message: "Password reset successfully. You can now login with your new password." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "An error occurred during password reset." });
  }
});

export default router;
