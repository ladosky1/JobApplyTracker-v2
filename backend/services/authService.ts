import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";

import User from "../model/User.js";
import PendingRegistration from "../model/PendingRegistration.js";
import RefreshSession from "../model/RefreshSession.js";
import { AppError } from "../errors/AppError.js";

import type {
    RegisterInput,
    VerifyEmailInput,
    ResendVerificationInput,
    ForgotPasswordInput,
    ResetPasswordInput,
    ChangePasswordInput,
} from "../types/authTypes.js";

import {
    VERIFICATION_CODE_EXPIRY_MINUTES,
    PENDING_REGISTRATION_EXPIRY_HOURS,
    PASSWORD_RESET_CODE_EXPIRY_MINUTES,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY_DAYS,
} from "../utils/authConstants.js";

import {
    generateVerificationCode,
    hashVerificationCode,
    verifyVerificationCode,
} from "../utils/verificationCode.js";

import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "./emailService.js";

import {ensureDefaultCategories} from "./categoryService.js";

const createExpiryDate = (minutes: number): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

const createPendingExpiryDate = (): Date => {
    return new Date(
        Date.now() + PENDING_REGISTRATION_EXPIRY_HOURS * 60 * 60 * 1000,
    );
};

const createRefreshExpiryDate = (): Date => {
    return new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );
};

const hashRefreshToken = (token: string): string => {
    return createHash("sha256").update(token).digest("hex");
};

const generateAccessToken = (
    userId: string,
    sessionId: string,
): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            id: userId,
            sid: sessionId,
        },
        secret,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        },
    );
};

const createLoginSession = async (userId: string) => {
    const refreshToken = randomBytes(32).toString("hex");

    const session = await RefreshSession.create({
        user: userId,
        tokenHash: hashRefreshToken(refreshToken),
        usedTokenHashes: [],
        expiresAt: createRefreshExpiryDate(),
        revokedAt: null,
    });

    const accessToken = generateAccessToken(
        userId,
        session._id.toString(),
    );

    return {
        accessToken,
        refreshToken,
    };
};

const revokeAllUserSessions = async (userId: string): Promise<void> => {
    await RefreshSession.updateMany(
        {
            user: userId,
            revokedAt: null,
        },
        {
            $set: {
                revokedAt: new Date(),
            },
        },
    );
};

const getPublicUser = (user: {
    _id: unknown;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const registerUser = async (
    input: RegisterInput,
): Promise<{ message: string }> => {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    const existingUser = await User.exists({ email });

    if (existingUser) {
        throw new AppError(
            "An account with this email already exists.",
            409,
        );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const code = generateVerificationCode();

    await PendingRegistration.findOneAndUpdate(
        { email },
        {
            name,
            email,
            passwordHash,
            verificationCodeHash: hashVerificationCode(code),
            verificationCodeExpiresAt: createExpiryDate(
                VERIFICATION_CODE_EXPIRY_MINUTES,
            ),
            expiresAt: createPendingExpiryDate(),
        },
        {
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        },
    );

    await sendVerificationEmail(email, name, code);

    return {
        message:
            "Registration started. Check your email for the verification code.",
    };
};

export const verifyEmail = async (
    input: VerifyEmailInput,
): Promise<{ message: string }> => {
    const email = input.email.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({ email }).select(
        "+passwordHash +verificationCodeHash",
    );

    if (!pending) {
        throw new AppError(
            "Registration not found or expired. Please register again.",
            400,
        );
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
        await PendingRegistration.deleteOne({ _id: pending._id });

        throw new AppError(
            "Registration has expired. Please register again.",
            400,
        );
    }

    if (pending.verificationCodeExpiresAt.getTime() <= Date.now()) {
        throw new AppError(
            "Verification code has expired. Request a new code.",
            400,
        );
    }

    const isValid = verifyVerificationCode(
        input.code,
        pending.verificationCodeHash,
    );

    if (!isValid) {
        throw new AppError("Invalid verification code.", 400);
    }

    const existingUser = await User.exists({ email });

    if (existingUser) {
        await PendingRegistration.deleteOne({ _id: pending._id });

        throw new AppError(
            "An account with this email already exists.",
            409,
        );
    }

    const user = await User.create({
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash, 
    });

    await ensureDefaultCategories(user._id.toString());

    await PendingRegistration.deleteOne({ _id: pending._id });

    return {
        message: "Email verified successfully. You can now log in.",
    };
};

export const resendVerificationCode = async (
    input: ResendVerificationInput,
): Promise<{ message: string }> => {
    const email = input.email.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({ email });

    if (!pending) {
        throw new AppError(
            "Registration not found or expired. Please register again.",
            400,
        );
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
        await PendingRegistration.deleteOne({ _id: pending._id });

        throw new AppError(
            "Registration has expired. Please register again.",
            400,
        );
    }

    const code = generateVerificationCode();

    pending.verificationCodeHash = hashVerificationCode(code);
    pending.verificationCodeExpiresAt = createExpiryDate(
        VERIFICATION_CODE_EXPIRY_MINUTES,
    );

    await pending.save();

    await sendVerificationEmail(email, pending.name, code);

    return {
        message: "A new verification code has been sent to your email.",
    };
};

export const loginUser = async (input: {
    email: string;
    password: string;
}) => {
    const email = input.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
        throw new AppError("Invalid email or password.", 401);
    }

    const { accessToken, refreshToken } = await createLoginSession(
        user._id.toString(),
    );

    return {
        accessToken,
        refreshToken,
        user: getPublicUser(user),
    };
};


export const refreshAccessToken = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new AppError("Refresh token is missing.", 401);
    }

    const oldTokenHash = hashRefreshToken(refreshToken);

    // Find the session that currently owns this refresh token.
    const session = await RefreshSession.findOne({
        tokenHash: oldTokenHash,
    }).select("+tokenHash +usedTokenHashes");

    if (!session) {
        // If this token was used previously, someone may be reusing
        // a stolen or copied refresh token. Revoke that session.
        const reusedSession = await RefreshSession.findOne({
            usedTokenHashes: oldTokenHash,
        });

        if (reusedSession) {
            await RefreshSession.updateOne(
                {
                    _id: reusedSession._id,
                    revokedAt: null,
                },
                {
                    $set: {
                        revokedAt: new Date(),
                    },
                },
            );
        }

        throw new AppError(
            "Refresh session is invalid. Please log in again.",
            401,
        );
    }

    if (
        session.revokedAt ||
        session.expiresAt.getTime() <= Date.now()
    ) {
        throw new AppError(
            "Refresh session has expired or been revoked. Please log in again.",
            401,
        );
    }

    const user = await User.findById(session.user);

    if (!user) {
        await RefreshSession.updateOne(
            { _id: session._id },
            { $set: { revokedAt: new Date() } },
        );

        throw new AppError("User not found.", 401);
    }

    // Create the next refresh token.
    const newRefreshToken = randomBytes(32).toString("hex");

    // Atomically replace the current token.
    // Only one request can successfully rotate this particular token.
    const updatedSession = await RefreshSession.findOneAndUpdate(
        {
            _id: session._id,
            tokenHash: oldTokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
        },
        {
            $addToSet: {
                usedTokenHashes: oldTokenHash,
            },
            $set: {
                tokenHash: hashRefreshToken(newRefreshToken),
                expiresAt: createRefreshExpiryDate(),
            },
        },
        {
            new: true,
        },
    );

    if (!updatedSession) {
        // Another request may have rotated this token first.
        // If it is now recorded as used, revoke the session.
        const reusedSession = await RefreshSession.findOne({
            _id: session._id,
            usedTokenHashes: oldTokenHash,
        });

        if (reusedSession) {
            await RefreshSession.updateOne(
                {
                    _id: reusedSession._id,
                    revokedAt: null,
                },
                {
                    $set: {
                        revokedAt: new Date(),
                    },
                },
            );
        }

        throw new AppError(
            "Refresh session is invalid. Please log in again.",
            401,
        );
    }

    const accessToken = generateAccessToken(
        user._id.toString(),
        updatedSession._id.toString(),
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

export const getCurrentUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    return getPublicUser(user);
};

export const forgotPassword = async (
    input: ForgotPasswordInput,
): Promise<{ message: string }> => {
    const email = input.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select(
        "+passwordResetCodeHash +passwordResetCodeExpiresAt",
    );

    const message =
        "If an account exists with that email, a password-reset code will be sent.";

    if (!user) {
        return { message };
    }

    const code = generateVerificationCode();

    user.passwordResetCodeHash = hashVerificationCode(code);
    user.passwordResetCodeExpiresAt = createExpiryDate(
        PASSWORD_RESET_CODE_EXPIRY_MINUTES,
    );

    await user.save();

    await sendPasswordResetEmail(user.email, user.name, code);

    return { message };
};


export const resetPassword = async (
    input: ResetPasswordInput,
): Promise<{ message: string }> => {
    const email = input.email.trim().toLowerCase();

    const user = await User.findOne({ email }).select(
        "+passwordHash +passwordResetCodeHash +passwordResetCodeExpiresAt",
    );

    if (
        !user ||
        !user.passwordResetCodeHash ||
        !user.passwordResetCodeExpiresAt
    ) {
        throw new AppError(
            "Invalid or expired password-reset code.",
            400,
        );
    }

    if (user.passwordResetCodeExpiresAt.getTime() <= Date.now()) {
        throw new AppError(
            "Invalid or expired password-reset code.",
            400,
        );
    }

    const isValid = verifyVerificationCode(
        input.code,
        user.passwordResetCodeHash,
    );

    if (!isValid) {
        throw new AppError(
            "Invalid or expired password-reset code.",
            400,
        );
    }

    user.passwordHash = await bcrypt.hash(input.newPassword, 12);
    user.passwordResetCodeHash = null;
    user.passwordResetCodeExpiresAt = null;
    user.passwordChangedAt = new Date();

    await user.save();

    await revokeAllUserSessions(user._id.toString());

    return {
        message: "Password reset successfully. Please log in again.",
    };
};

export const changePassword = async (
    userId: string,
    input: ChangePasswordInput,
): Promise<{ message: string }> => {
    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
        throw new AppError("Current password is incorrect.", 400);
    }

    user.passwordHash = await bcrypt.hash(input.newPassword, 12);
    user.passwordChangedAt = new Date();

    await user.save();

    // Log out all sessions, including the current one.
    await revokeAllUserSessions(user._id.toString());

    return {
        message: "Password changed successfully. Please log in again.",
    };
};

export const logoutUser = async (
    refreshToken?: string,
    sessionId?: string,
): Promise<{ message: string }> => {
    const revokedAt = new Date();

    if (sessionId) {
        await RefreshSession.updateOne(
            {
                _id: sessionId,
                revokedAt: null,
            },
            {
                $set: { revokedAt },
            },
        );
    }

    if (refreshToken) {
        const tokenHash = hashRefreshToken(refreshToken);

        await RefreshSession.updateOne(
            {
                tokenHash,
                revokedAt: null,
            },
            {
                $set: { revokedAt },
            },
        );

        const reusedSession = await RefreshSession.findOne({
            usedTokenHashes: tokenHash,
        });

        if (reusedSession) {
            await RefreshSession.updateOne(
                {
                    _id: reusedSession._id,
                    revokedAt: null,
                },
                {
                    $set: { revokedAt },
                },
            );
        }
    }

    return {
        message: "Logged out successfully.",
    };
};