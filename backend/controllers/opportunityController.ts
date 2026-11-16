import type { Request, Response, NextFunction } from "express";

import { AppError } from "../errors/AppError.js";

import {
    createOpportunity as createOpportunityService,
    getOpportunities as getOpportunitiesService,
    getDashboardSummary as getDashboardSummaryService,
    updateOpportunity as updateOpportunityService,
    deleteOpportunity as deleteOpportunityService,
} from "../services/opportunityService.js";
import { getOpportunitiesSchema } from "../validators/opportunityValidator.js";

const getAuthenticatedUserId = (req: Request): string => {
    if (!req.user) {
        throw new AppError("Authentication required.", 401);
    }

    return req.user._id.toString();
};

export const getOpportunities = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const options = getOpportunitiesSchema.shape.query.parse(req.query);

        const result = await getOpportunitiesService(userId, options);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const createOpportunity = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const opportunity = await createOpportunityService(
            userId,
            req.body,
        );

        res.status(201).json({
            message: "Opportunity created successfully.",
            opportunity,
        });
    } catch (error) {
        next(error);
    }
};

export const updateOpportunity = async (
    req: Request<{ opportunityId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const { opportunityId } = req.params;

        const opportunity = await updateOpportunityService(
            userId,
            opportunityId,
            req.body,
        );

        res.status(200).json({
            message: "Opportunity updated successfully.",
            opportunity,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOpportunity = async (
    req: Request<{ opportunityId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const { opportunityId } = req.params;

        await deleteOpportunityService(userId, opportunityId);

        res.status(200).json({
            message: "Opportunity deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const summary = await getDashboardSummaryService(userId);

        res.status(200).json({ summary });
    } catch (error) {
        next(error);
    }
};