import { rateLimit } from "express-rate-limit";

const createRateLimiter = (
    windowMs: number,
    limit: number,
    message: string,
) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message },
    });

export const loginLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    "Too many login attempts. Please try again in 15 minutes.",
);

export const registerLimiter = createRateLimiter(
    60 * 60 * 1000,
    5,
    "Too many registration attempts. Please try again later.",
);

export const verificationLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    "Too many verification attempts. Please try again in 15 minutes.",
);

export const passwordResetLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    "Too many password-reset attempts. Please try again in 15 minutes.",
);

export const refreshLimiter = createRateLimiter(
    15 * 60 * 1000,
    30,
    "Too many session-refresh requests. Please try again later.",
);