import express from "express";

import {
    registerUser,
    verifyEmail,
    resendVerificationCode,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
    loginLimiter,
    registerLimiter,
    verificationLimiter,
    passwordResetLimiter,
    refreshLimiter,
} from "../middleware/rateLimiter.js";

import {
    registerSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} from "../validators/authValidator.js";

const router = express.Router();

router.post(
    "/register",
    registerLimiter,
    validate(registerSchema),
    registerUser,
);

router.post(
    "/verify-email",
    verificationLimiter,
    validate(verifyEmailSchema),
    verifyEmail,
);

router.post(
    "/resend-verification",
    verificationLimiter,
    validate(resendVerificationSchema),
    resendVerificationCode,
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    loginUser,
);

router.post(
    "/refresh",
    refreshLimiter,
    refreshAccessToken,
);

router.post(
    "/logout",
    logoutUser,
);

router.get("/me", protect, getMe);

router.post(
    "/forgot-password",
    passwordResetLimiter,
    validate(forgotPasswordSchema),
    forgotPassword,
);

router.post(
    "/reset-password",
    passwordResetLimiter,
    validate(resetPasswordSchema),
    resetPassword,
);

router.patch(
    "/change-password",
    protect,
    validate(changePasswordSchema),
    changePassword,
);

export default router;