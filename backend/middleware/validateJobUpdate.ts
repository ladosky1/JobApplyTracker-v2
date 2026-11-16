import type { Request, Response, NextFunction } from "express";

const validateJobUpdate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const { company, roles, status, category } = req.body;

    if (company !== undefined && typeof company !== "string") {
        res.status(400).json({
            error: "Company must be a string.",
        });
        return;
    }

    if (roles !== undefined && typeof roles !== "string") {
        res.status(400).json({
            error: "Roles must be a string.",
        });
        return;
    }

    const validStatuses = [
        "applied",
        "interview",
        "offer",
        "rejected",
    ];

    if (
        status !== undefined &&
        (typeof status !== "string" || !validStatuses.includes(status))
    ) {
        res.status(400).json({
            error: "Invalid status value.",
        });
        return;
    }

    const validCategories = [
        "Technology",
        "Hospitality",
        "Retails",
    ];

    if (
        category !== undefined &&
        (typeof category !== "string" || !validCategories.includes(category))
    ) {
        res.status(400).json({
            error: "Invalid category value.",
        });
        return;
    }

    next();
};

export default validateJobUpdate;