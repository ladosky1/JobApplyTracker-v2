import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

import {
    getCategories as getCategoriesService,
    createCategory as createCategoryService,
    updateCategory as updateCategoryService,
    deleteCategory as deleteCategoryService,
} from "../services/categoryService.js";

const getAuthenticatedUserId = (req: Request): string => {
    if (!req.user) {
        throw new AppError("Authentication required.", 401);
    }

    return req.user._id.toString();
};

export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const categories = await getCategoriesService(userId);

        res.status(200).json({
            categories,
        });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const { name, type } = req.body;

        const category = await createCategoryService(
            userId,
            name,
            type,
        );

        res.status(201).json({
            message: "Category created successfully.",
            category,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        const { categoryId } = req.params;
        const { name } = req.body;

        const category = await updateCategoryService(
            userId,
            categoryId,
            name,
        );

        res.status(200).json({
            message: "Category updated successfully.",
            category,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req: Request<{ categoryId: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const { categoryId } = req.params;

        await deleteCategoryService(userId, categoryId);

        res.status(200).json({
            message: "Category deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};