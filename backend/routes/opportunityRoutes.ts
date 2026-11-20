import express from "express";

import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
    createOpportunity,
    deleteOpportunity,
    getDashboardSummary,
    getOpportunities,
    getOpportunityById,
    updateOpportunity,
} from "../controllers/opportunityController.js";

import {
    createOpportunitySchema,
    updateOpportunitySchema,
    getOpportunitiesSchema,
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