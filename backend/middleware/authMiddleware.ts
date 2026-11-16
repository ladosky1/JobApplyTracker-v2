import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import jwt, { type JwtPayload } from "jsonwebtoken";

import User from "../model/User.js";
import RefreshSession from "../model/RefreshSession.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: Types.ObjectId;
                name: string;
                email: string;
            };

            auth?: {
                sessionId: string;
            };
        }
    }
}

const protect = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "Not Authorized" });
            return;
        }

        const token = authHeader.slice("Bearer ".length).trim();

        if (!token) {
            res.status(401).json({ message: "Not Authorized" });
            return;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            next(new Error("JWT_SECRET is not configured"));
            return;
        }

        let decoded: string | JwtPayload;

        try {
            decoded = jwt.verify(token, secret);
        } catch {
            res.status(401).json({ message: "Not Authorized" });
            return;
        }

        if (
            typeof decoded === "string" ||
            typeof decoded.id !== "string" ||
            typeof decoded.sid !== "string" ||
            typeof decoded.iat !== "number"
        ) {
            res.status(401).json({ message: "Not Authorized" });
            return;
        }

        const activeSession = await RefreshSession.exists({
            _id: decoded.sid,
            user: decoded.id,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
        });

        if (!activeSession) {
            res.status(401).json({ message: "Session expired or revoked" });
            return;
        }

        const user = await User.findById(decoded.id).select(
            "name email passwordChangedAt",
        );

        if (!user) {
            res.status(401).json({ message: "Not Authorized" });
            return;
        }

        if (
            user.passwordChangedAt &&
            decoded.iat <
                Math.floor(user.passwordChangedAt.getTime() / 1000)
        ) {
            res.status(401).json({ message: "Please log in again" });
            return;
        }

        req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
        };

        req.auth = {
            sessionId: decoded.sid,
        };

        next();
    } catch (error) {
        next(error);
    }
};

export default protect;