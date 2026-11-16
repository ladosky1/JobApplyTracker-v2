import mongoose, { type Model } from "mongoose";

export interface IPendingRegistration {
    name: string;
    email: string;
    passwordHash: string;
    verificationCodeHash: string;
    verificationCodeExpiresAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const pendingRegistrationSchema =
    new mongoose.Schema<IPendingRegistration>(
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
                lowercase: true,
                trim: true,
            },
            passwordHash: {
                type: String,
                required: true,
                select: false,
            },
            verificationCodeHash: {
                type: String,
                required: true,
                select: false,
            },
            verificationCodeExpiresAt: {
                type: Date,
                required: true,
            },
            expiresAt: {
                type: Date,
                required: true,
            },
        },
        {
            timestamps: true,
        },
    );

pendingRegistrationSchema.index(
    { email: 1 },
    { unique: true },
);

pendingRegistrationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
);

const PendingRegistration: Model<IPendingRegistration> =
    mongoose.model<IPendingRegistration>(
        "pendingRegistration",
        pendingRegistrationSchema,
    );

export default PendingRegistration;