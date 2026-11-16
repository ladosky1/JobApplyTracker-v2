import { Schema, model, type Types } from "mongoose";

interface IRefreshSession {
    user: Types.ObjectId;
    tokenHash: string;
    usedTokenHashes: string[];
    expiresAt: Date;
    revokedAt: Date | null;
}

const refreshSessionSchema = new Schema<IRefreshSession>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },
        usedTokenHashes: {
            type: [String],
            default: [],
            select: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const RefreshSession = model<IRefreshSession>(
    "RefreshSession",
    refreshSessionSchema,
);

export default RefreshSession;