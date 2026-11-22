import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.'),

  password: z
    .string()
    .min(1, 'Password is required.')
    .max(128, 'Password is too long.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(80, 'Name cannot exceed 80 characters.'),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Enter a valid email address.'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password cannot exceed 128 characters.'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;


export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.'),

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid six-digit verification code.'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.'),
});

export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordSchema
>;


export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Enter a valid email address.'),

    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter a valid six-digit reset code.'),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password cannot exceed 128 characters.'),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<
  typeof resetPasswordSchema
>;
