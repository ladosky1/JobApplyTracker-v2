import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters.");

const verificationCodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be 6 digits.");

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters.")
            .max(80, "Name cannot exceed 80 characters."),
        email: emailSchema,
        password: passwordSchema,
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        email: emailSchema,
        code: verificationCodeSchema,
    }),
});

export const resendVerificationSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, "Password is required.").max(128),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: emailSchema,
        code: verificationCodeSchema,
        newPassword: passwordSchema,
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required.").max(128),
        newPassword: passwordSchema,
    }).refine(
        (data) => data.currentPassword !== data.newPassword,
        {
            message: "New password must be different from your current password.",
            path: ["newPassword"],
        },
    ),
});