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

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    };

    if (remember === true) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.cookie("accessToken", result.accessToken, cookieOptions);

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
        sameSite: "lax",
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
   FORGOT PASSWORD
========================= */
export const forgotPasswordOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is required");

    const result = await authService.forgotPasswordOtp(email);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const result = await authService.resetPassword(
        email,
        otp,
        password
    );

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

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        success: true,
        data: {
            refreshToken: result.refreshToken
        },
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
        sameSite: "lax",
    });

    res.status(200).json({
        success: true,
        message: "Logged out from all devices",
    });
});