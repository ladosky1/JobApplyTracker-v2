import type { Request, Response } from "express";

import { AppError } from "../errors/AppError.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "../utils/authConstants.js";

import {
    registerUser as registerUserService,
    verifyEmail as verifyEmailService,
    resendVerificationCode as resendVerificationCodeService,
    loginUser as loginUserService,
    refreshAccessToken as refreshAccessTokenService,
    getCurrentUser,
    forgotPassword as forgotPasswordService,
    resetPassword as resetPasswordService,
    changePassword as changePasswordService,
    logoutUser as logoutUserService,
} from "../services/authService.js";


const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (
        process.env.NODE_ENV === "production" ? "none" : "lax"
    ) as "none" | "lax",
    path: "/",
});

const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
        ...getRefreshCookieOptions(),
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

const clearRefreshCookie = (res: Response): void => {
    res.clearCookie(
        REFRESH_TOKEN_COOKIE_NAME,
        getRefreshCookieOptions(),
    );
};

const getRefreshTokenFromRequest = (
    req: Request,
): string | undefined => {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return undefined;
    }

    const cookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) =>
            part.startsWith(`${REFRESH_TOKEN_COOKIE_NAME}=`),
        );

    if (!cookie) {
        return undefined;
    }

    const value = cookie.slice(
        REFRESH_TOKEN_COOKIE_NAME.length + 1,
    );

    try {
        return decodeURIComponent(value);
    } catch {
        return undefined;
    }
};


export const getMe = async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError("Not authorized.", 401);
    }

    const user = await getCurrentUser(req.user._id.toString());

    res.status(200).json({ user });
};


export const registerUser = async (
    req: Request,
    res: Response,
) => {
    const result = await registerUserService(req.body);

    res.status(201).json(result);
};


export const verifyEmail = async (
    req: Request,
    res: Response,
) => {
    const result = await verifyEmailService(req.body);

    res.status(200).json(result);
};

export const resendVerificationCode = async (
    req: Request,
    res: Response,
) => {
    const result = await resendVerificationCodeService(req.body);

    res.status(200).json(result);
};


export const loginUser = async (
    req: Request,
    res: Response,
) => {
    const result = await loginUserService(req.body);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
    });
};

export const refreshAccessToken = async (
    req: Request,
    res: Response,
) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
        clearRefreshCookie(res);

        throw new AppError("Refresh session is missing. Please log in again.", 401);
    }

    const result = await refreshAccessTokenService(refreshToken);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
        accessToken: result.accessToken,
    });
};


export const forgotPassword = async (
    req: Request,
    res: Response,
) => {
    const result = await forgotPasswordService(req.body);

    res.status(200).json(result);
};


export const resetPassword = async (
    req: Request,
    res: Response,
) => {
    const result = await resetPasswordService(req.body);

    clearRefreshCookie(res);

    res.status(200).json(result);
};


export const changePassword = async (
    req: Request,
    res: Response,
) => {
    if (!req.user) {
        throw new AppError("Not authorized.", 401);
    }

    const result = await changePasswordService(
        req.user._id.toString(),
        req.body,
    );

    clearRefreshCookie(res);

    res.status(200).json(result);
};


export const logoutUser = async (
    req: Request,
    res: Response,
) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    const sessionId = req.auth?.sessionId;

    await logoutUserService(refreshToken, sessionId);

    clearRefreshCookie(res);

    res.status(200).json({
        message: "Logged out successfully.",
    });
};