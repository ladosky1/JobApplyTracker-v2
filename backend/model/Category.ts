import mongoose, { type Model, type Types } from "mongoose";

export type CategoryType = "job" | "gig";

export interface ICategory {
    user: Types.ObjectId;
    name: string;
    normalizedName: string;
    type: CategoryType;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        normalizedName: {
            type: String,
            required: true,
            select: false,
        },
        type: {
            type: String,
            enum: ["job", "gig"],
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

categorySchema.index(
    { user: 1, type: 1, normalizedName: 1 },
    { unique: true },
);

const Category: Model<ICategory> = mongoose.model<ICategory>(
    "Category",
    categorySchema,
);

export default Category;