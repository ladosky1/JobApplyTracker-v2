import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Expected application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Request validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    // Invalid MongoDB document IDs
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            message: "Invalid ID format",
        });
    }

    // Mongoose schema validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            message: "Invalid data provided",
        });
    }

    // MongoDB duplicate-key errors
    if (err?.code === 11000) {
        return res.status(409).json({
            message: "A record with this value already exists",
        });
    }

    // Unexpected errors: details stay on the server
    console.error("Unhandled application error:", err);

    return res.status(500).json({
        message: "Internal Server Error",
    });
};

export { errorHandler };