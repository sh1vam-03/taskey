import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import {
    signAccessToken,
    signRefreshToken,
    generateJti,
} from "../utils/jwt.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { sendOtpEmail, sendPasswordResetEmail } from "./email.service.js"; // Import Email Service
import { addMinutes, addDays } from "date-fns";
import {
    OtpPurpose,
    AccountStatus,
} from "@prisma/client";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";

/* =========================
   SIGNUP
========================= */
export const signup = async (name, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Generate secure OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await prisma.otp.create({
        data: {
            code: hashedOtp, // Store Hashed OTP
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            expiresAt: addMinutes(new Date(), 10),
            userId: user.id,
        },
    });

    // Send via Email Service
    await sendOtpEmail({
        to: user.email,
        otp: otp, // Send Plain OTP
    });

    return {
        email: user.email,
        message: "OTP sent successfully to your email",
    };
};

/* =========================
   VERIFY OTP
========================= */
export const verifyOtp = async (email, otpCode) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new ApiError(404, "User not found");

    // Hash the input OTP to compare with stored hash
    const hashedInputOtp = hashOtp(otpCode);

    const otpRecord = await prisma.otp.findFirst({
        where: {
            userId: user.id,
            code: hashedInputOtp, // Compare Hashed
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            isUsed: false,
            expiresAt: { gte: new Date() },
        },
    });

    if (!otpRecord) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
        }),
        prisma.otp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        }),
    ]);

    return { message: "Email verified successfully" };
};

/* =========================
   LOGIN
========================= */
export const login = async (email, password, userAgent, ipAddress) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(401, "Email not verified");
    }

    if (user.status !== AccountStatus.ACTIVE) {
        throw new ApiError(403, "Account is not active");
    }

    const isPasswordValid = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Generate session
    const jti = generateJti();

    const accessToken = signAccessToken({
        userId: user.id,
        tokenVersion: user.tokenVersion,
        jti,
    });

    const refreshToken = signRefreshToken({
        userId: user.id,
        tokenVersion: user.tokenVersion,
        jti,
    });

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    await prisma.session.create({
        data: {
            accessTokenJti: jti,
            refreshTokenHash,
            userAgent,
            ipAddress,
            expiresAt: addDays(new Date(), 30),
            userId: user.id,
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
        },
    };
};

/* =========================
   LOGOUT (SINGLE DEVICE)
========================= */
export const logout = async (sessionId) => {
    await prisma.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
    });

    return { message: "Logout successful" };
};

/* =========================
   OTP REQUEST (EMAIL VERIFY)
========================= */
export const otpRequest = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new ApiError(404, "User not found");

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified");
    }

    await prisma.otp.updateMany({
        where: {
            userId: user.id,
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            isUsed: false,
        },
        data: { isUsed: true },
    });

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await prisma.otp.create({
        data: {
            code: hashedOtp, // Store Hashed
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            expiresAt: addMinutes(new Date(), 10),
            userId: user.id,
        },
    });

    await sendOtpEmail({
        to: user.email,
        otp: otp,
    });

    return { message: "OTP sent successfully" };
};

/* =========================
   FORGOT PASSWORD (LINK BASED)
========================= */
export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) return { message: "If an account exists, a reset link has been sent." };

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token for storage
    const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expiry (15 minutes)
    const passwordResetExpires = addMinutes(new Date(), 15);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken,
            passwordResetExpires,
        },
    });

    // Construct Reset URL (Frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send via Email Service
    await sendPasswordResetEmail({
        to: user.email,
        resetLink,
    });

    return { message: "If an account exists, a reset link has been sent." };
};

/* =========================
   RESET PASSWORD
========================= */
/* =========================
   RESET PASSWORD (LINK BASED)
========================= */
export const resetPassword = async (token, password) => {
    // Hash the token from the URL to compare with DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() }, // Check if not expired
        },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    const hashedPassword = await hashPassword(password);

    // Bumps token version to invalidate all sessions on password reset (Security practice)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null, // Consume token (Single use)
            passwordResetExpires: null,
            tokenVersion: { increment: 1 } // Invalidate existing sessions
        },
    });

    // Also revoke all active sessions explicitly if needed, but tokenVersion handles it for JWTs.
    // For extra safety, we can revoke database sessions too.
    await prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
    });

    return { message: "Password reset successfully" };
};

/* =========================
   DELETE ACCOUNT
========================= */
export const deleteMyAccount = async (userId) => {
    await prisma.user.delete({
        where: { id: userId },
    });

    return { message: "Account deleted successfully" };
};

/* =========================
   GET PROFILE
========================= */
export const getMyProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            plan: true,
            isEmailVerified: true,
            createdAt: true,
        },
    });

    if (!user) throw new ApiError(404, "User not found");

    return user;
};



/* =========================
   REFRESH TOKEN
========================= */
export const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        throw new ApiError(401, "Invalid refresh token");
    }

    // Hash incoming refresh token
    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    // Find existing session
    const session = await prisma.session.findFirst({
        where: {
            refreshTokenHash,
            revokedAt: null,
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            user: true,
        },
    });

    if (!session) {
        throw new ApiError(401, "Session expired");
    }

    // Check token version
    if (decoded.tokenVersion !== session.user.tokenVersion) {
        throw new ApiError(401, "Token revoked");
    }

    // Rotate session (VERY IMPORTANT)
    const newJti = generateJti();

    const newAccessToken = signAccessToken({
        userId: session.userId,
        tokenVersion: session.user.tokenVersion,
        jti: newJti,
    });

    const newRefreshToken = signRefreshToken({
        userId: session.userId,
        tokenVersion: session.user.tokenVersion,
        jti: newJti,
    });

    const newRefreshTokenHash = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

    // Revoke old session & create new one
    await prisma.$transaction([
        prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        }),
        prisma.session.create({
            data: {
                accessTokenJti: newJti,
                refreshTokenHash: newRefreshTokenHash,
                userAgent: session.userAgent,
                ipAddress: session.ipAddress,
                expiresAt: addDays(new Date(), 30),
                userId: session.userId,
            },
        }),
    ]);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

/* =========================
   LOGOUT ALL SESSIONS
========================= */
export const logoutAll = async (userId) => {
    // Increment token version to invalidate all JWTs
    await prisma.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } }
    });

    await prisma.session.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });

    return { message: "Logged out from all devices" };
};