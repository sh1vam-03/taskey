import * as authService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// =========================
// CONFIGURATION LIBRARIES
// =========================
const ACCESS_COOKIE_MAX_AGE = Number(process.env.ACCESS_COOKIE_MAX_AGE) || 15 * 60 * 1000; // 15m default
const REFRESH_COOKIE_PERSISTENT_MAX_AGE = Number(process.env.REFRESH_COOKIE_PERSISTENT_MAX_AGE) || 21 * 24 * 60 * 60 * 1000; // 21d default

const COOKIE_SECURE = process.env.NODE_ENV === "production"; // Default strict rule
const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || "lax"; // Default lax rule for easier dev/redirects

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
    const accessCookieOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
    };

    // Only set maxAge if persistent (Remember Me)
    if (remember) {
        accessCookieOptions.maxAge = ACCESS_COOKIE_MAX_AGE;
    }

    res.cookie("accessToken", result.accessToken, accessCookieOptions);

    // 2. Refresh Token Cookie (Controls Persistence)
    const refreshTokenOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
        path: "/",
    };

    if (result.isPersistent) {
        refreshTokenOptions.maxAge = REFRESH_COOKIE_PERSISTENT_MAX_AGE;
    }

    // If not remember, no maxAge -> Session Cookie

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

    const cookieOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/" });
    // Also clear root path just in case
    res.clearCookie("refreshToken", cookieOptions);

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
    const accessCookieOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
    };

    if (result.isPersistent) {
        accessCookieOptions.maxAge = ACCESS_COOKIE_MAX_AGE;
    }

    res.cookie("accessToken", result.accessToken, accessCookieOptions);

    // 2. Set New Refresh Token Cookie
    const refreshTokenOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
        path: "/",
    };

    // If persistent, set maxAge. If not, session cookie.
    if (result.isPersistent) {
        refreshTokenOptions.maxAge = REFRESH_COOKIE_PERSISTENT_MAX_AGE;
    }

    res.cookie("refreshToken", result.refreshToken, refreshTokenOptions);

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

    const cookieOptions = {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: COOKIE_SAMESITE,
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/" });
    // Also clear root path just in case
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({
        success: true,
        message: "Logged out from all devices",
    });
});