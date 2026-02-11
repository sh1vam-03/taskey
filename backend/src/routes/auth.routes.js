import express from "express";
import * as authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/otp-request", authController.otpRequest);
// ❌ Deprecated: OTP-based password reset (Replaced by email reset-link flow)
// router.post("/forgot-password", authController.forgotPasswordOtp);
// router.post("/reset-password", authController.resetPassword);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authMiddleware, authController.logout);
router.delete("/me", authMiddleware, authController.deleteMyAccount);
router.get("/me", authMiddleware, authController.getMyProfile);
router.post("/refresh", authController.refreshToken);
router.post("/logout-all", authMiddleware, authController.logoutAll);

export default router;
