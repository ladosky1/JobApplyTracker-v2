import { z } from "zod";
import {
    JOB_STATUSES as jobStatuses,
    GIG_STATUSES as gigStatuses,
} from "../utils/opportunityConstants.js"

const allStatuses = [...jobStatuses, ...gigStatuses] as const;

const opportunityTypeSchema = z.enum(["job", "gig"]);

const opportunityStatusSchema = z.enum(allStatuses);

const titleSchema = z
    .string()
    .trim()
    .min(2, "Opportunity title must contain at least 2 characters.")
    .max(150, "Opportunity title cannot exceed 150 characters.");

const organizationNameSchema = z
    .string()
    .trim()
    .max(120, "Organization name cannot exceed 120 characters.");

const categoryIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid category ID.");

const linkSchema = z
    .string()
    .trim()
    .max(2048, "Link cannot exceed 2048 characters.")
    .url("Enter a valid URL.")
    .refine((value) => {
        try {
            const { protocol } = new URL(value);
            return protocol === "http:" || protocol === "https:";
        } catch {
            return false;
        }
    }, "Link must start with http:// or https://");

const notesSchema = z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters.");

const followUpAtSchema = z
    .string()
    .datetime({ message: "Enter a valid ISO 8601 date and time." })
    .nullable();

export const createOpportunitySchema = z.object({
    body: z
        .object({
            type: opportunityTypeSchema,
            title: titleSchema,
            organizationName: organizationNameSchema.optional(),
            categoryId: categoryIdSchema.nullable().optional(),
            status: opportunityStatusSchema.optional(),
            link: linkSchema.optional(),
            notes: notesSchema.optional(),
            followUpAt: followUpAtSchema.optional(),
        })
        .superRefine((data, ctx) => {
            if (!data.status) return;

            const validStatuses =
                data.type === "job" ? jobStatuses : gigStatuses;

            if (!(validStatuses as readonly string[]).includes(data.status)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["status"],
                    message: `Invalid status for ${data.type} opportunity.`,
                });
            }
        }),
});

export const updateOpportunitySchema = z.object({
    params: z.object({
        opportunityId: z.string().regex(
            /^[a-f\d]{24}$/i,
            "Invalid opportunity ID.",
        ),
    }),
    body: z
        .object({
            title: titleSchema.optional(),
            organizationName: organizationNameSchema.nullable().optional(),
            categoryId: categoryIdSchema.nullable().optional(),
            status: opportunityStatusSchema.optional(),
            link: linkSchema.nullable().optional(),
            notes: notesSchema.nullable().optional(),
            followUpAt: followUpAtSchema.optional(),
        })
        .refine(
            (data) => Object.keys(data).length > 0,
            "Provide at least one field to update.",
        ),
});

export const getOpportunitiesSchema = z.object({
    query: z
        .object({
            type: opportunityTypeSchema.optional(),
            status: opportunityStatusSchema.optional(),
            categoryId: categoryIdSchema.optional(),
            search: z.string().trim().max(100, "Search cannot exceed 100 characters.").optional(),
            sort: z
                .enum(["newest", "oldest", "title_asc", "title_desc"])
                .default("newest"),
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(50).default(10),
        })
        .superRefine((data, ctx) => {
            if (!data.type || !data.status) return;

            const validStatuses =
                data.type === "job" ? jobStatuses : gigStatuses;

            if (!(validStatuses as readonly string[]).includes(data.status)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["status"],
                    message: `Invalid status for ${data.type} opportunity.`,
                });
            }
        }),
});

export const getRemindersSchema = z.object({
    query: z.object({
        status: z
            .enum(["upcoming", "due", "overdue", "sent"])
            .default("upcoming"),

        type: opportunityTypeSchema.optional(),

        search: z
            .string()
            .trim()
            .max(100, "Search cannot exceed 100 characters.")
            .optional(),

        page: z.coerce.number().int().min(1).default(1),

        limit: z.coerce.number().int().min(1).max(50).default(10),
    }),
});