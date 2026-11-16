import mongoose, { type Model, type Types } from "mongoose";
import {
    JOB_STATUSES,
    GIG_STATUSES,
} from "../utils/opportunityConstants.js";

export type OpportunityType = "job" | "gig";

export type JobStatus = (typeof JOB_STATUSES)[number];

export type GigStatus = (typeof GIG_STATUSES)[number];

export type OpportunityStatus = JobStatus | GigStatus;

export interface IOpportunity {
    user: Types.ObjectId;
    type: OpportunityType;
    title: string;
    organizationName?: string;
    category: Types.ObjectId;
    status: OpportunityStatus;
    statusChangedAt: Date;
    link?: string;
    notes?: string;
    followUpAt?: Date | null;
    followUpEmailSentAt?: Date | null;
    followUpEmailClaimedAt?: Date | null;
    followUpEmailAttempts: number;
    createdAt: Date;
    appliedAt: Date | null;
    updatedAt: Date;
}

const opportunitySchema = new mongoose.Schema<IOpportunity>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        type: {
            type: String,
            enum: ["job", "gig"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150,
        },
        organizationName: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: [
                "saved",
                "applied",
                "interview",
                "offer",
                "accepted",
                "rejected",
                "withdrawn",
                "lead",
                "contacted",
                "negotiating",
                "in_progress",
                "completed",
                "declined",
                "cancelled",
            ],
        },
        statusChangedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        appliedAt: {
            type: Date,
            default: null,
        },
        link: {
            type: String,
            trim: true,
            maxlength: 2048,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 5000,
        },
        followUpAt: {
            type: Date,
            default: null,
        },
        followUpEmailSentAt: {
            type: Date,
            default: null,
        },
        followUpEmailClaimedAt: {
            type: Date,
            default: null,
        },
        followUpEmailAttempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

opportunitySchema.index({
    user: 1,
    type: 1,
    status: 1,
    createdAt: -1,
});

opportunitySchema.index({
    user: 1,
    category: 1,
});

opportunitySchema.index({
    followUpAt: 1,
    followUpEmailSentAt: 1,
    followUpEmailClaimedAt: 1,
});

const Opportunity: Model<IOpportunity> =
    mongoose.model<IOpportunity>("Opportunity", opportunitySchema);

export default Opportunity;