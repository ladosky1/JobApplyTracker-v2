import express from "express";

import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";

import {
    createCategorySchema,
    updateCategorySchema,
} from "../validators/categoryValidator.js";

const router = express.Router();

router.use(protect);

router.get("/", getCategories);
router.post(
    "/",
    validate(createCategorySchema),
    createCategory,
);
router.patch(
    "/:categoryId",
    validate(updateCategorySchema),
    updateCategory,
);

router.delete("/:categoryId", deleteCategory);

export default router;