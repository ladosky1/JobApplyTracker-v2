import mongoose, { type Model } from "mongoose";

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    passwordResetCodeHash: string | null;
    passwordResetCodeExpiresAt: Date | null;
    passwordChangedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        passwordResetCodeHash: {
            type: String,
            default: null,
            select: false,
        },
        passwordResetCodeExpiresAt: {
            type: Date,
            default: null,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

const User: Model<IUser> = mongoose.model<IUser>("user", userSchema);

export default User;