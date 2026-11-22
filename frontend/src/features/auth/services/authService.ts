
import {
  apiClient,
  refreshAccessToken,
} from '../../../services/api/apiClient';

import { tokenManager } from '../../../services/api/tokenManager';

import type {
  AuthResponse,
  AuthUser,
  AuthUserResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

const mapAuthUser = (user: AuthUserResponse): AuthUser => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const authService = {
  async register(payload: RegisterRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      '/auth/register',
      payload,
    );
    return data;
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      '/auth/verify-email',
      payload,
    );
    return data;
  },

  async resendVerification(
    payload: ResendVerificationRequest,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      '/auth/resend-verification',
      payload,
    );
    return data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await apiClient.post<{
      accessToken: string;
      user: AuthUserResponse;
    }>('/auth/login', payload);

    tokenManager.setAccessToken(data.accessToken);

    return {
      accessToken: data.accessToken,
      user: mapAuthUser(data.user),
    };
  },

  async refreshSession(): Promise<string> {
    return refreshAccessToken();
  },

  async logout(): Promise<MessageResponse> {
    try {
      const { data } = await apiClient.post<MessageResponse>('/auth/logout');
      return data;
    } finally {
      tokenManager.clearAccessToken();
    }
  },

  async getCurrentUser(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ user: AuthUserResponse }>(
      '/auth/me',
    );
    return mapAuthUser(data.user);
  },

  async forgotPassword(
    payload: ForgotPasswordRequest,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      '/auth/forgot-password',
      payload,
    );
    return data;
  },

  async resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.post<MessageResponse>(
      '/auth/reset-password',
      payload,
    );

    tokenManager.clearAccessToken();
    return data;
  },

  async changePassword(
    payload: ChangePasswordRequest,
  ): Promise<MessageResponse> {
    const { data } = await apiClient.patch<MessageResponse>(
      '/auth/change-password',
      payload,
    );

    tokenManager.clearAccessToken();
    return data;
  },
};
