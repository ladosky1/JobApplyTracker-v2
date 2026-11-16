export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface VerifyEmailInput {
    email: string;
    code: string;
}

export interface ResendVerificationInput {
    email: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    email: string;
    code: string;
    newPassword: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}