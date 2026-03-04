import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// =========================
// CONFIGURATION LIBRARIES
// =========================
const ACCESS_COOKIE_MAX_AGE = Number(process.env.ACCESS_COOKIE_MAX_AGE) || 15 * 60 * 1000; // 15m default
const REFRESH_COOKIE_PERSISTENT_MAX_AGE = Number(process.env.REFRESH_COOKIE_PERSISTENT_MAX_AGE) || 21 * 24 * 60 * 60 * 1000; // 21d default

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
};

/* =========================
   SIGNUP
========================= */
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    try {
        const result = await authService.signup(name, email, password);

        res.status(201).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        throw error;
    }
});

/* =========================
   VERIFY OTP
========================= */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const result = await authService.verifyOtp(email, otp);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

/* =========================
   LOGIN
========================= */
export const login = asyncHandler(async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const result = await authService.login(
        email,
        password,
        req.headers["user-agent"],
        req.ip,
        remember // Pass remember flag
    );

    // 1. Access Token Cookie
    res.cookie("accessToken", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_MAX_AGE,
    });

    // 2. Refresh Token Cookie (Controls Persistence)
    // remember=true  → persistent cookie with 21-day maxAge
    // remember=false → session cookie (no maxAge), cleared when browser closes
    res.cookie("refreshToken", result.refreshToken, {
        ...COOKIE_OPTIONS,
        ...(remember ? { maxAge: REFRESH_COOKIE_PERSISTENT_MAX_AGE } : {}),
    });

    res.status(200).json({
        success: true,
        message: "Authentication successful",
        data: {
            user: result.user
        },
    });
});

/* =========================
   LOGOUT
========================= */
export const logout = asyncHandler(async (req, res) => {
    if (req.sessionId) {
        await authService.logout(req.sessionId);
    }

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});

/* =========================
   OTP REQUEST
========================= */
export const otpRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const result = await authService.otpRequest(email);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

/* =========================
   FORGOT PASSWORD (LINK)
========================= */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const result = await authService.forgotPassword(email);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});


/* =========================
   RESET PASSWORD (LINK)
========================= */
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new ApiError(400, "Token and password are required");
    }

    const result = await authService.resetPassword(token, password);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

/* =========================
   GET PROFILE
========================= */
export const getMyProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const profile = await authService.getMyProfile(userId);

    res.status(200).json({
        success: true,
        data: profile,
    });
});


// =========================
// REFRESH TOKEN
// =========================
export const refreshToken = asyncHandler(async (req, res) => {
    // 1. Read from Cookie ONLY
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    const result = await authService.refreshToken(refreshToken);

    // 1. Set Access Token Cookie
    res.cookie("accessToken", result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_COOKIE_MAX_AGE,
    });

    // 2. Set New Refresh Token Cookie
    // Persistent → 21-day maxAge; Non-persistent → session cookie (no maxAge)
    res.cookie("refreshToken", result.refreshToken, {
        ...COOKIE_OPTIONS,
        ...(result.isPersistent ? { maxAge: REFRESH_COOKIE_PERSISTENT_MAX_AGE } : {}),
    });

    res.status(200).json({
        success: true,
        message: "Session refreshed",
        accessToken: result.accessToken,
    });
});

/* =========================
   LOGOUT ALL DEVICES
========================= */
export const logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user.id);

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    res.status(200).json({
        success: true,
        message: "Logged out from all devices",
    });
});

/* =========================
   REQUEST SECURITY OTP
========================= */
export const requestSecurityOtp = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { password } = req.body; // Optional password for pre-validation
    const result = await authService.requestSecurityOtp(userId, password);
    res.status(200).json({ success: true, message: result.message });
});

/* =========================
   UPDATE PROFILE
========================= */
export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, timezone } = req.body;

    // We allow name OR timezone or both.
    if (!name && !timezone) throw new ApiError(400, "Nothing to update");

    const updatedUser = await authService.updateProfile(userId, { name, timezone });

    res.status(200).json({
        success: true,
        message: "Profile updated",
        data: updatedUser,
    });
});

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword, otp } = req.body;

    if (!oldPassword || !newPassword || !otp) {
        throw new ApiError(400, "Passwords and Security OTP are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    const result = await authService.changePassword(userId, oldPassword, newPassword, otp);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

/* =========================
   DELETE ACCOUNT
========================= */
export const deleteMyAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) throw new ApiError(400, "Security OTP is required to delete account");

    const result = await authService.deleteMyAccount(userId, otp);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});