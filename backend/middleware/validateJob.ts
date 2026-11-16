import type { Request, Response, NextFunction } from "express";

const validateJob = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const { company, roles } = req.body;

    if (!company || !roles) {
        res.status(400).json({
            error: "Company and roles are required.",
        });
        return;
    }

    next();
};

export default validateJob;
