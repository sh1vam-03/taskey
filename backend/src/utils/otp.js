import crypto from 'crypto';

/**
 * Generate a secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOtp = () => {
    // Generate a random number between 0 and 999999
    const otp = crypto.randomInt(0, 1000000);
    // Pad with leading zeros to ensure 6 digits
    return otp.toString().padStart(6, '0');
};

/**
 * Hash an OTP for secure storage
 * @param {string} otp - The plain text OTP
 * @returns {string} The hashed OTP
 */
export const hashOtp = (otp) => {
    return crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');
};

/**
 * Verify an OTP against a hash
 * @param {string} otp - The plain text OTP to verify
 * @param {string} hash - The stored hash
 * @returns {boolean} True if match
 */
export const verifyOtpHash = (otp, hash) => {
    const computedHash = hashOtp(otp);
    return computedHash === hash;
};