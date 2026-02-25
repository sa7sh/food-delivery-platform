import bcrypt from 'bcrypt';

/**
 * Generates a 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
export const generateNumericOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes an OTP using bcrypt
 * @param {string} otp 
 * @returns {Promise<string>} hashed OTP
 */
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

/**
 * Compares a plain OTP with a hashed OTP
 * @param {string} plainOtp 
 * @param {string} hashedOtp 
 * @returns {Promise<boolean>}
 */
export const verifyOTP = async (plainOtp, hashedOtp) => {
  if (!plainOtp || !hashedOtp) return false;
  return await bcrypt.compare(plainOtp, hashedOtp);
};
