import mongoose from "mongoose";
import Category, { type CategoryType } from "../model/Category.js";
import Opportunity from "../model/Opportunity.js";
import { AppError } from "../errors/AppError.js";

const cleanName = (name: string): string =>
    name.trim().replace(/\s+/g, " ");

const normalizeCategoryName = (name: string): string =>
    cleanName(name).toLowerCase();

const isDuplicateKeyError = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;

export const ensureDefaultCategories = async (
    userId: string,
): Promise<void> => {
    const types: CategoryType[] = ["job", "gig"];

    for (const type of types) {
        try {
            await Category.findOneAndUpdate(
                {
                    user: userId,
                    type,
                    normalizedName: "others",
                },
                {
                    $setOnInsert: {
                        user: userId,
                        name: "Others",
                        normalizedName: "others",
                        type,
                        isDefault: true,
                    },
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                },
            );
        } catch (error) {
            if (!isDuplicateKeyError(error)) {
                throw error;
            }
        }
    }
};

export const getCategories = async (userId: string) => {
    await ensureDefaultCategories(userId);

    return Category.find({ user: userId }).sort({
        type: 1,
        isDefault: -1,
        normalizedName: 1,
    });
};

export const createCategory = async (
    userId: string,
    name: string,
    type: CategoryType,
) => {
    const normalizedName = normalizeCategoryName(name);

    try {
        return await Category.create({
            user: userId,
            name: cleanName(name),
            normalizedName,
            type,
            isDefault: false,
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new AppError(
                "A category with this name already exists for this opportunity type.",
                409,
            );
        }

        throw error;
    }
};

export const updateCategory = async (
    userId: string,
    categoryId: string,
    name: string,
) => {
    const category = await Category.findOne({
        _id: categoryId,
        user: userId,
    });

    if (!category) {
        throw new AppError("Category not found.", 404);
    }

    if (category.isDefault) {
        throw new AppError(
            "The default Others category cannot be renamed.",
            403,
        );
    }

    try {
        category.name = cleanName(name);
        category.normalizedName = normalizeCategoryName(name);

        return await category.save();
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            throw new AppError(
                "A category with this name already exists for this opportunity type.",
                409,
            );
        }

        throw error;
    }
};

export const deleteCategory = async (
    userId: string,
    categoryId: string,
): Promise<void> => {
    if (!mongoose.isValidObjectId(categoryId)) {
        throw new AppError("Invalid category ID.", 400);
    }

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const category = await Category.findOne({
                _id: categoryId,
                user: userId,
            })
                .select("+normalizedName")
                .session(session);

            if (!category) {
                throw new AppError("Category not found.", 404);
            }

            if (category.isDefault || category.normalizedName === "others") {
                throw new AppError(
                    "The default Others category cannot be deleted.",
                    403,
                );
            }

            const defaultCategory = await Category.findOne({
                user: userId,
                type: category.type,
                isDefault: true,
            }).session(session);

            if (!defaultCategory) {
                throw new AppError(
                    "Default category could not be found.",
                    500,
                );
            }

            await Opportunity.updateMany(
                {
                    user: userId,
                    category: category._id,
                },
                {
                    $set: {
                        category: defaultCategory._id,
                    },
                },
                { session },
            );

            const result = await Category.deleteOne(
                {
                    _id: category._id,
                    user: userId,
                    isDefault: false,
                    normalizedName: { $ne: "others" },
                },
                { session },
            );

            if (result.deletedCount !== 1) {
                throw new AppError(
                    "Category could not be deleted.",
                    409,
                );
            }
        });
    } finally {
        await session.endSession();
    }
};