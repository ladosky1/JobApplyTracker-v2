import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";

import Opportunity, {
    type IOpportunity,
    type OpportunityType,
    type OpportunityStatus,
} from "../model/Opportunity.js";

import {
    JOB_STATUSES as jobStatuses,
    GIG_STATUSES as gigStatuses,
    TERMINAL_JOB_STATUSES,
    TERMINAL_GIG_STATUSES,
} from "../utils/opportunityConstants.js";

import Category from "../model/Category.js";
import { AppError } from "../errors/AppError.js";
import { ensureDefaultCategories } from "./categoryService.js";

const isValidStatus = (
    type: OpportunityType,
    status: string,
): boolean => {
    return type === "job"
        ? (jobStatuses as readonly string[]).includes(status)
        : (gigStatuses as readonly string[]).includes(status);
};

type OpportunityQueryOptions = {
    type?: OpportunityType;
    status?: OpportunityStatus;
    categoryId?: string;
    search?: string;
    sort: "newest" | "oldest" | "title_asc" | "title_desc";
    page: number;
    limit: number;
};

export const getOpportunities = async (
    userId: string,
    options: OpportunityQueryOptions,
) => {
    const {
        type,
        status,
        categoryId,
        search,
        sort,
        page,
        limit,
    } = options;

    const filter: QueryFilter<IOpportunity> = {
        user: new mongoose.Types.ObjectId(userId),
    };

    if (type) {
        filter.type = type;
    }

    if (status) {
        filter.status = status;
    }

    if (categoryId) {
        const category = await Category.findOne({
            _id: categoryId,
            user: userId,
        });

        if (!category) {
            throw new AppError("Category not found.", 404);
        }

        if (type && category.type !== type) {
            throw new AppError(
                "Category does not belong to this opportunity type.",
                400,
            );
        }

        filter.category = new mongoose.Types.ObjectId(categoryId);
    }

    if (search) {
        const escapedSearch = search.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );

        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { title: searchRegex },
            { organizationName: searchRegex },
        ];
    }

    const sortOptions = {
        newest: { createdAt: -1, _id: -1 },
        oldest: { createdAt: 1, _id: 1 },
        title_asc: { title: 1, _id: 1 },
        title_desc: { title: -1, _id: -1 },
    } as const;

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
        Opportunity.find(filter)
            .collation({ locale: "en", strength: 2 })
            .populate("category", "name type isDefault")
            .sort(sortOptions[sort])
            .skip(skip)
            .limit(limit),

        Opportunity.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        opportunities,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1 && total > 0,
        },
    };
};

const getCategory = async (
    userId: string,
    type: OpportunityType,
    categoryId?: string | null,
) => {
    if (categoryId) {
        if (!mongoose.isValidObjectId(categoryId)) {
            throw new AppError("Invalid category ID.", 400);
        }

        const category = await Category.findOne({
            _id: categoryId,
            user: userId,
            type,
        });

        if (!category) {
            throw new AppError(
                "Category not found for this opportunity type.",
                404,
            );
        }

        return category;
    }

    await ensureDefaultCategories(userId);

    const defaultCategory = await Category.findOne({
        user: userId,
        type,
        isDefault: true,
    });

    if (!defaultCategory) {
        throw new AppError(
            "Default category could not be found.",
            500,
        );
    }

    return defaultCategory;
};

export const createOpportunity = async (
    userId: string,
    input: {
        type: OpportunityType;
        title: string;
        organizationName?: string;
        categoryId?: string | null;
        status?: OpportunityStatus;
        link?: string;
        notes?: string;
        followUpAt?: string | null;
    },
) => {
    const status = input.status ?? (
        input.type === "job" ? "saved" : "lead"
    );

    if (!isValidStatus(input.type, status)) {
        throw new AppError(
            `Invalid status for ${input.type} opportunity.`,
            400,
        );
    }

    const category = await getCategory(
        userId,
        input.type,
        input.categoryId,
    );

    const createdOpportunity = await Opportunity.create({
        user: userId,
        type: input.type,
        title: input.title.trim(),
        organizationName: input.organizationName?.trim(),
        category: category._id,
        status,
        link: input.link,
        notes: input.notes,
        appliedAt:
        input.type === "job" && status !== "saved"
            ? new Date()
            : null,
        followUpAt: input.followUpAt
            ? new Date(input.followUpAt)
            : null,
        followUpEmailSentAt: null,
        followUpEmailClaimedAt: null,
    });

    return createdOpportunity.populate("category", "name type isDefault");
};

export const updateOpportunity = async (
    userId: string,
    opportunityId: string,
    input: {
        title?: string;
        organizationName?: string | null;
        categoryId?: string | null;
        status?: OpportunityStatus;
        link?: string | null;
        notes?: string | null;
        followUpAt?: string | null;
    },
) => {
    if (!mongoose.isValidObjectId(opportunityId)) {
        throw new AppError("Invalid opportunity ID.", 400);
    }

    const opportunity = await Opportunity.findOne({
        _id: opportunityId,
        user: userId,
    });

    if (!opportunity) {
        throw new AppError("Opportunity not found.", 404);
    }

    if (
        input.status &&
        !isValidStatus(opportunity.type, input.status)
    ) {
        throw new AppError(
            `Invalid status for ${opportunity.type} opportunity.`,
            400,
        );
    }

    if (input.categoryId !== undefined) {
        const category = await getCategory(
            userId,
            opportunity.type,
            input.categoryId,
        );

        opportunity.category = category._id;
    }

    if (input.title !== undefined) {
        opportunity.title = input.title.trim();
    }

    if (input.organizationName !== undefined) {
        opportunity.organizationName = input.organizationName?.trim() || undefined;
    }

    if (
        input.status !== undefined &&
        input.status !== opportunity.status
    ) {
        const previousStatus = opportunity.status;

        opportunity.status = input.status;
        opportunity.statusChangedAt = new Date();

        if (
            opportunity.type === "job" &&
            previousStatus === "saved" &&
            input.status === "applied" &&
            !opportunity.appliedAt
        ) {
            opportunity.appliedAt = new Date();
        }
    }

    if (input.link !== undefined) {
        opportunity.link = input.link ?? undefined;
    }

    if (input.notes !== undefined) {
        opportunity.notes = input.notes ?? undefined;
    }

    if (input.followUpAt !== undefined) {
        const nextFollowUpAt = input.followUpAt
            ? new Date(input.followUpAt)
            : null;

        const currentTimestamp =
            opportunity.followUpAt?.getTime() ?? null;

        const nextTimestamp =
            nextFollowUpAt?.getTime() ?? null;

        if (currentTimestamp !== nextTimestamp) {
            opportunity.followUpAt = nextFollowUpAt;

            opportunity.followUpEmailSentAt = null;
            opportunity.followUpEmailClaimedAt = null;
            opportunity.followUpEmailAttempts = 0;
        }
    }

    await opportunity.save();

    return opportunity.populate("category", "name type isDefault");
};

export const deleteOpportunity = async (
    userId: string,
    opportunityId: string,
): Promise<void> => {
    if (!mongoose.isValidObjectId(opportunityId)) {
        throw new AppError("Invalid opportunity ID.", 400);
    }

    const deletedOpportunity = await Opportunity.findOneAndDelete({
        _id: opportunityId,
        user: userId,
    });

    if (!deletedOpportunity) {
        throw new AppError("Opportunity not found.", 404);
    }
};



type DashboardAggregationResult = {
    overview: {
        total: number;
        jobs: number;
        gigs: number;
        activeJobs: number;
        activeGigs: number;
        acceptedJobs: number;
        completedGigs: number;
        rejectedJobs: number;
        declinedGigs: number;
        cancelledGigs: number;
        successfulOutcomes: number;
    }[];
    jobStatuses: {
        _id: string;
        count: number;
    }[];
    gigStatuses: {
        _id: string;
        count: number;
    }[];
    reminders: {
        upcoming: number;
        due: number;
        overdue: number;
        sent: number;
    }[];

    categoryBreakdown: {
        _id: {
            type: "job" | "gig";
            categoryId: mongoose.Types.ObjectId;
            categoryName: string;
        };
        count: number;
    }[];

    activityOverTime: {
        _id: {
            month: string;
            type: "job" | "gig";
        };
        count: number;
    }[];

    applicationsOverTime: {
        _id: string;
        count: number;
    }[];
};

export const getDashboardSummary = async (userId: string) => {
    const now = new Date();
    const timeZone = process.env.APP_TIME_ZONE || "UTC";

    const isActiveOpportunity = {
        $or: [
            {
                $and: [
                    { $eq: ["$type", "job"] },
                    {
                        $not: [
                            {
                                $in: ["$status", [...TERMINAL_JOB_STATUSES]],
                            },
                        ],
                    },
                ],
            },
            {
                $and: [
                    { $eq: ["$type", "gig"] },
                    {
                        $not: [
                            {
                                $in: ["$status", [...TERMINAL_GIG_STATUSES]],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    // Compare calendar days using the application's configured timezone.
    const followUpDay = {
        $dateTrunc: {
            date: "$followUpAt",
            unit: "day",
            timezone: timeZone,
        },
    };

    const today = {
        $dateTrunc: {
            date: now,
            unit: "day",
            timezone: timeZone,
        },
    };

    const [result] = await Opportunity.aggregate<DashboardAggregationResult>([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $facet: {
                overview: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            jobs: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "job"] }, 1, 0],
                                },
                            },
                            gigs: {
                                $sum: {
                                    $cond: [{ $eq: ["$type", "gig"] }, 1, 0],
                                },
                            },
                            activeJobs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "job"] },
                                                {
                                                    $not: [
                                                        {
                                                            $in: [
                                                                "$status",
                                                                [...TERMINAL_JOB_STATUSES],
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            activeGigs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "gig"] },
                                                {
                                                    $not: [
                                                        {
                                                            $in: [
                                                                "$status",
                                                                [...TERMINAL_GIG_STATUSES],
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            acceptedJobs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "job"] },
                                                { $eq: ["$status", "accepted"] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            rejectedJobs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "job"] },
                                                { $eq: ["$status", "rejected"] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            completedGigs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "gig"] },
                                                { $eq: ["$status", "completed"] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                            declinedGigs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "gig"] },
                                                { $eq: ["$status", "declined"] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },

                            cancelledGigs: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $eq: ["$type", "gig"] },
                                                { $eq: ["$status", "cancelled"] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            total: 1,
                            jobs: 1,
                            gigs: 1,
                            activeJobs: 1,
                            activeGigs: 1,
                            acceptedJobs: 1,
                            completedGigs: 1,
                            rejectedJobs: 1,
                            declinedGigs: 1,
                            cancelledGigs: 1,
                            successfulOutcomes: {
                                $add: ["$acceptedJobs", "$completedGigs"],
                            },
                        },
                    },
                ],

                jobStatuses: [
                    { $match: { type: "job" } },
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ],

                gigStatuses: [
                    { $match: { type: "gig" } },
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ],

                reminders: [
                    {
                        $match: {
                            followUpAt: { $ne: null },
                        },
                    },
                    {
                        $group: {
                            _id: null,

                            upcoming: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                isActiveOpportunity,
                                                { $gt: [followUpDay, today] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },

                            due: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                isActiveOpportunity,
                                                { $eq: [followUpDay, today] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },

                            overdue: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                isActiveOpportunity,
                                                { $lt: [followUpDay, today] },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },

                            // Email delivery is independent of follow-up date buckets.
                            sent: {
                                $sum: {
                                    $cond: [
                                        { $ne: ["$followUpEmailSentAt", null] },
                                        1,
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $project: { _id: 0 },
                    },
                ],

                categoryBreakdown: [
                    {
                        $group: {
                            _id: {
                                type: "$type",
                                categoryId: "$category",
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $lookup: {
                            from: "categories",
                            localField: "_id.categoryId",
                            foreignField: "_id",
                            as: "categoryInfo",
                        },
                    },
                    {
                        $unwind: "$categoryInfo",
                    },
                    {
                        $project: {
                            _id: {
                                type: "$_id.type",
                                categoryId: "$_id.categoryId",
                                categoryName: "$categoryInfo.name",
                            },
                            count: 1,
                        },
                    },
                    {
                        $sort: { count: -1 },
                    },
                ],

                activityOverTime: [
                    {
                        $match: {
                            $expr: {
                                $gte: [
                                    "$createdAt",
                                    {
                                        $dateTrunc: {
                                            date: {
                                                $dateSubtract: {
                                                    startDate: "$$NOW",
                                                    unit: "month",
                                                    amount: 5,
                                                    timezone: timeZone,
                                                },
                                            },
                                            unit: "month",
                                            timezone: timeZone,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                month: {
                                    $dateToString: {
                                        date: "$createdAt",
                                        format: "%Y-%m",
                                        timezone: timeZone,
                                    },
                                },
                                type: "$type",
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { "_id.month": 1 },
                    },
                ],
                applicationsOverTime: [
                    {
                        $match: {
                            type: "job",
                            appliedAt: { $ne: null },
                            $expr: {
                                $gte: [
                                    "$appliedAt",
                                    {
                                        $dateTrunc: {
                                            date: {
                                                $dateSubtract: {
                                                    startDate: "$$NOW",
                                                    unit: "month",
                                                    amount: 5,
                                                    timezone: timeZone,
                                                },
                                            },
                                            unit: "month",
                                            timezone: timeZone,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: {
                                    date: "$appliedAt",
                                    format: "%Y-%m",
                                    timezone: timeZone,
                                },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { _id: 1 },
                    },
                ],
            },
        },
    ]);

    const overview = result?.overview[0] ?? {
        total: 0,
        jobs: 0,
        gigs: 0,
        activeJobs: 0,
        activeGigs: 0,
        acceptedJobs: 0,
        completedGigs: 0,
        rejectedJobs: 0,
        declinedGigs: 0,
        cancelledGigs: 0,
        successfulOutcomes: 0,
    };

    const decidedApplications =
        overview.acceptedJobs + overview.rejectedJobs;

    const finalizedGigs =
        overview.completedGigs +
        overview.declinedGigs +
        overview.cancelledGigs;

    const performance = {
        applicationSuccess: {
            accepted: overview.acceptedJobs,
            rejected: overview.rejectedJobs,
            decided: decidedApplications,
            rate: decidedApplications > 0
                ? Number(
                    (
                        (overview.acceptedJobs / decidedApplications) * 100
                    ).toFixed(2),
                )
                : null,
        },

        gigCompletion: {
            completed: overview.completedGigs,
            declined: overview.declinedGigs,
            cancelled: overview.cancelledGigs,
            finalized: finalizedGigs,
            rate: finalizedGigs > 0
                ? Number(
                    (
                        (overview.completedGigs / finalizedGigs) * 100
                    ).toFixed(2),
                )
                : null,
        },
    };

    const jobStatusCounts = new Map(
        (result?.jobStatuses ?? []).map(({ _id, count }) => [_id, count]),
    );

    const gigStatusCounts = new Map(
        (result?.gigStatuses ?? []).map(({ _id, count }) => [_id, count]),
    );

    return {
        overview,
        performance,

        jobStatuses: jobStatuses.map((status) => ({
            status,
            count: jobStatusCounts.get(status) ?? 0,
        })),

        gigStatuses: gigStatuses.map((status) => ({
            status,
            count: gigStatusCounts.get(status) ?? 0,
        })),

        reminders: result?.reminders[0] ?? {
            upcoming: 0,
            due: 0,
            overdue: 0,
            sent: 0,
        },

        categoryBreakdown: (result?.categoryBreakdown ?? []).map(
            ({ _id, count }) => ({
                type: _id.type,
                categoryId: _id.categoryId,
                categoryName: _id.categoryName,
                count,
            }),
        ),

        activityOverTime: (result?.activityOverTime ?? []).map(
            ({ _id, count }) => ({
                month: _id.month,
                type: _id.type,
                count,
            }),
        ),

        applicationsOverTime: (result?.applicationsOverTime ?? []).map(
            ({ _id, count }) => ({
                month: _id,
                count,
            }),
        ),
    };
};

