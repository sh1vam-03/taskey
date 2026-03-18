import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    generateJti,
} from "../utils/jwt.js";
import { generateOtp, hashOtp } from "../utils/otp.js";
import { PLANS } from "../config/plans.config.js";
import { PlanType } from "@prisma/client";
import { sendOtpEmail, sendPasswordResetEmail } from "./email.service.js";
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
            subscriptionCredits: PLANS[PlanType.FREE].credits.MONTHLY || 0,
            topupCredits: 0
        },
    });

    // Generate secure OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await prisma.otp.create({
        data: {
            code: hashedOtp,
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            expiresAt: addMinutes(new Date(), 10),
            userId: user.id,
        },
    });

    await sendOtpEmail({
        to: user.email,
        otp: otp,
    });

    return {
        email: user.email,
        message: "OTP sent successfully to your email",
    };
};

/* =========================
   VERIFY OTP
========================= */
// Helper to generate tokens and session after successful auth/verification
const _generateTokensAndSession = async (user, userAgent, ipAddress, remember = false) => {
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
            userAgent: userAgent || "Unknown",
            ipAddress: ipAddress || "0.0.0.0",
            expiresAt: remember
                ? addDays(new Date(), 21)
                : addMinutes(new Date(), 30),
            isPersistent: remember,
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
            createdAt: user.createdAt,
            subscriptionCredits: user.subscriptionCredits || 0,
            topupCredits: user.topupCredits || 0,
            timezone: user.timezone,
        },
    };
};

/* =========================
   VERIFY OTP
========================= */
export const verifyOtp = async (email, otpCode, userAgent, ipAddress) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new ApiError(404, "User not found");

    const hashedInputOtp = hashOtp(otpCode);

    const otpRecord = await prisma.otp.findFirst({
        where: {
            userId: user.id,
            code: hashedInputOtp,
            purpose: OtpPurpose.EMAIL_VERIFICATION,
            isUsed: false,
            expiresAt: { gte: new Date() },
        },
    });

    if (!otpRecord) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
        }),
        prisma.otp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        }),
    ]);

    // Automatically log in after email verification
    return await _generateTokensAndSession(updatedUser, userAgent, ipAddress, true);
};

/* =========================
   LOGIN
========================= */
export const login = async (email, password, userAgent, ipAddress, remember = false) => {
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

    return await _generateTokensAndSession(user, userAgent, ipAddress, remember);
};

/* =========================
   LOGOUT
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
            code: hashedOtp,
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
   FORGOT PASSWORD
========================= */
export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const passwordResetExpires = addMinutes(new Date(), 15);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken,
            passwordResetExpires,
        },
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
        to: user.email,
        resetLink,
    });

    return { message: "Reset link has been sent to your email." };
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (token, password) => {
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: hashedToken,
            passwordResetExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            tokenVersion: { increment: 1 }
        },
    });

    await prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
    });

    return { message: "Password reset successfully" };
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

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

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

    if (decoded.tokenVersion !== session.user.tokenVersion) {
        throw new ApiError(401, "Token revoked");
    }

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
                expiresAt: session.isPersistent
                    ? addDays(new Date(), 21)
                    : addMinutes(new Date(), 30),
                isPersistent: session.isPersistent,
                userId: session.userId,
            },
        }),
    ]);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        isPersistent: session.isPersistent,
    };
};

/* =========================
   LOGOUT ALL
========================= */
export const logoutAll = async (userId) => {
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

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = async (userId, data) => {
    const { name, timezone } = data;

    const updateData = {};
    if (name) updateData.name = name;
    if (timezone) updateData.timezone = timezone;

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true, // Read-only
            plan: true,
            isEmailVerified: true,
            createdAt: true,
            subscriptionCredits: true,
            topupCredits: true,
            timezone: true,
        }
    });

    return user;
};

/* =========================
   REQUEST SECURITY OTP
========================= */
export const requestSecurityOtp = async (userId, currentPassword = null) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");

    // Optional: Pre-validate password if provided (e.g. for Change Password flow)
    if (currentPassword) {
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) throw new ApiError(400, "Incorrect current password");
    }

    // Invalidate old security OTPs
    await prisma.otp.updateMany({
        where: { userId, purpose: OtpPurpose.SECURITY_ACTION, isUsed: false },
        data: { isUsed: true }
    });

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await prisma.otp.create({
        data: {
            code: hashedOtp,
            purpose: OtpPurpose.SECURITY_ACTION,
            expiresAt: addMinutes(new Date(), 10),
            userId: user.id
        }
    });

    await sendOtpEmail({ to: user.email, otp, subject: "Your Security Code" });

    return { message: "Security code sent to your email" };
};

/* =========================
   VERIFY SECURITY OTP HElPER
========================= */
const verifySecurityOtp = async (userId, otpCode) => {
    const hashedInputOtp = hashOtp(otpCode);

    const otpRecord = await prisma.otp.findFirst({
        where: {
            userId,
            code: hashedInputOtp,
            purpose: OtpPurpose.SECURITY_ACTION,
            isUsed: false,
            expiresAt: { gte: new Date() }
        }
    });

    if (!otpRecord) throw new ApiError(400, "Invalid or expired security code");

    await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
    });

    return true;
};

/* =========================
   CHANGE PASSWORD (OTP)
========================= */
export const changePassword = async (userId, oldPassword, newPassword, otp) => {
    if (!otp) throw new ApiError(400, "Security OTP is required");
    await verifySecurityOtp(userId, otp);

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new ApiError(404, "User not found");

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect current password");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            tokenVersion: { increment: 1 }
        },
    });

    return { message: "Password updated successfully" };
};

/* =========================
   DELETE ACCOUNT (OTP)
========================= */
export const deleteMyAccount = async (userId, otp) => {
    if (!otp) throw new ApiError(400, "Security OTP is required");
    await verifySecurityOtp(userId, otp);

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
            subscriptionCredits: true,
            topupCredits: true,
            timezone: true,
        },
    }); if (!user) throw new ApiError(404, "User not found");

    return user;
};