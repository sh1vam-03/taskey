import { Resend } from 'resend';
import ApiError from '../utils/ApiError.js';

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!resendApiKey) {
    console.warn("⚠️ RESEND_API_KEY is not set in environment variables. Email sending will fail.");
}

const resend = new Resend(resendApiKey);

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 */
export const sendOtpEmail = async ({ to, otp }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to,
            subject: 'Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Verify Your Email</h2>
                    <p>Use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>If you did not request this code, please ignore this email.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new ApiError(500, "Failed to send verification email");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email Service Error (sendOtpEmail):", error);
        throw new ApiError(500, "Failed to send verification email");
    }
};

/**
 * Send Password Reset Email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Reset token to append to URL
 */
export const sendPasswordResetEmail = async ({ to, resetLink }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reset Your Password</h2>
                    <p>You have requested to reset your password. Click the button below to proceed.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>This link will expire in 15 minutes.</p>
                    <p>If you did not request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new ApiError(500, "Failed to send password reset email");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email Service Error (sendPasswordResetEmail):", error);
        throw new ApiError(500, "Failed to send password reset email");
    }
};
