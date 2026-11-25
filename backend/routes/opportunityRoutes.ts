import express from "express";

import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
    createOpportunity,
    deleteOpportunity,
    getDashboardSummary,
    getOpportunities,
    getOpportunityById,
    getReminders,
    updateOpportunity,
} from "../controllers/opportunityController.js";

import {
    createOpportunitySchema,
    updateOpportunitySchema,
    getOpportunitiesSchema,
    getRemindersSchema
} from "../validators/opportunityValidator.js";

const router = express.Router();

router.use(protect);

router.get(
    "/dashboard",
    getDashboardSummary
);

router.get(
    "/",
    validate(getOpportunitiesSchema),
    getOpportunities,
);

router.get(
    "/reminders",
    validate(getRemindersSchema),
    getReminders,
);

router.get("/:opportunityId", getOpportunityById);

router.post(
    "/",
    validate(createOpportunitySchema),
    createOpportunity,
);

router.patch(
    "/:opportunityId",
    validate(updateOpportunitySchema),
    updateOpportunity,
);

router.delete(
    "/:opportunityId",
    deleteOpportunity,
);

export default router;