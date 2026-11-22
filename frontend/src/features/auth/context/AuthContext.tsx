import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { authService } from '../services/authService';
import type { AuthUser, LoginRequest } from '../types/auth.types';
import { tokenManager } from '../../../services/api/tokenManager';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Shared across provider mounts to avoid duplicate refresh requests
// during React StrictMode's development effect checks.
let sessionRestorePromise: Promise<AuthUser | null> | null = null;

const restoreSession = (): Promise<AuthUser | null> => {
  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      try {
        await authService.refreshSession();
        return await authService.getCurrentUser();
      } catch {
        tokenManager.clearAccessToken();
        return null;
      }
    })();
  }

  return sessionRestorePromise;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const restoredUser = await restoreSession();

      if (isMounted) {
        setUser(restoredUser);
        setIsLoading(false);
      }
    };

    const handleSessionExpired = () => {
      tokenManager.clearAccessToken();
      sessionRestorePromise = Promise.resolve(null);

      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    void initializeAuth();

    return () => {
      isMounted = false;
      window.removeEventListener(
        'auth:session-expired',
        handleSessionExpired,
      );
    };
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);

    sessionRestorePromise = Promise.resolve(response.user);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      sessionRestorePromise = Promise.resolve(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
