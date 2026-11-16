import { z } from "zod";

const categoryNameSchema = z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(50, "Category name cannot exceed 50 characters.");

const categoryTypeSchema = z.enum(["job", "gig"]);

export const createCategorySchema = z.object({
    body: z.object({
        name: categoryNameSchema,
        type: categoryTypeSchema,
    }),
});

export const updateCategorySchema = z.object({
    body: z.object({
        name: categoryNameSchema,
    }),
    params: z.object({
        categoryId: z.string().regex(
            /^[a-f\d]{24}$/i,
            "Invalid category ID.",
        ),
    }),
});

export const deleteCategorySchema = z.object({
    body: z.object({
        mode: z.enum(["reassign", "delete_opportunities"]),
    }),
    params: z.object({
        categoryId: z.string().regex(
            /^[a-f\d]{24}$/i,
            "Invalid category ID.",
        ),
    }),
});