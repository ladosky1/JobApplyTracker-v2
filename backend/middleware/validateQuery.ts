import type { Request, Response, NextFunction } from "express";

const validateQuery = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const { page, limit, status } = req.query;

    if (
        page !== undefined &&
        (!Number.isInteger(Number(page)) || Number(page) <= 0)
    ) {
        res.status(400).json({
            error: "page must be a positive integer",
        });
        return;
    }

    if (
        limit !== undefined &&
        (
            !Number.isInteger(Number(limit)) ||
            Number(limit) <= 0 ||
            Number(limit) > 100
        )
    ) {
        res.status(400).json({
            error: "limit must be between 1 and 100",
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
        (
            typeof status !== "string" ||
            !validStatuses.includes(status)
        )
    ) {
        res.status(400).json({
            error: `status must be one of ${validStatuses.join(", ")}`,
        });
        return;
    }

    next();
};

export default validateQuery;
