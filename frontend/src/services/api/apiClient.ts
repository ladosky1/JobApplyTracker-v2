
import axios, {
  type InternalAxiosRequestConfig,
} from 'axios';

import { tokenManager } from './tokenManager';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate client prevents refresh requests from triggering
// the normal response interceptor.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

// Every refresh operation must go through this function.
export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ accessToken: string }>('/auth/refresh')
      .then(({ data }) => {
        tokenManager.setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((error: unknown) => {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          tokenManager.clearAccessToken();

          window.dispatchEvent(
            new CustomEvent('auth:session-expired'),
          );
        }

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Attach the current access token to outgoing requests.
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const isPublicAuthEndpoint = (url?: string): boolean => {
  const excludedEndpoints = [
    '/auth/register',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/login',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  return excludedEndpoints.some((endpoint) =>
    url?.startsWith(endpoint),
  );
};

apiClient.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest =
      error.config as RetryableRequestConfig;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isPublicAuthEndpoint(originalRequest.url) ||
      !tokenManager.hasAccessToken()
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
