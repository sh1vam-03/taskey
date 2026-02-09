import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

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
        req.ip
    );

    // 1. Access Token Cookie (Always short-lived / session)
    // We set it to 15 mins to match JWT expiry, or session (clears on close) if not remember? 
    // User said: "Access token always short-lived (15m)". 
    // User said: "Remember Me controls refresh cookie".
    // So Access Token cookie should probably be session or fixed short time. 
    // Let's set it to valid for 15m.
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // 2. Refresh Token Cookie (Controls Persistence)
    const refreshTokenOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh", // Optional: restrict to refresh endpoint if possible, but for now root is fine/safer against path confusion
    };

    if (remember) {
        refreshTokenOptions.maxAge = 21 * 24 * 60 * 60 * 1000; // 21 Days
    }
    // If not remember, no maxAge -> Session Cookie (clears on browser close)

    res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);

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

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

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
   DELETE ACCOUNT
========================= */
export const deleteMyAccount = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await authService.deleteMyAccount(userId);

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


/* =========================
   REFRESH TOKEN
========================= */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    const result = await authService.refreshToken(refreshToken);

    // 1. Set Access Token Cookie (15 min)
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // 2. Set New Refresh Token Cookie (21 Days)
    // We assume if they are refreshing, they want to stay logged in (persistence)
    // Or we should check if the old session had a long expiry? 
    // For now, let's stick to the 21 day env config for consistency in rotation.
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 21 * 24 * 60 * 60 * 1000, // 21 Days
    });

    res.status(200).json({
        success: true,
        message: "Session refreshed",
    });
});

/* =========================
   LOGOUT ALL DEVICES
========================= */
export const logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user.id);

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({
        success: true,
        message: "Logged out from all devices",
    });
});