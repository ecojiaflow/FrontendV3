// frontend/src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium';
  isEmailVerified?: boolean;
  quotas?: {
    analyses: number;
    aiQuestions: number;
    exports: number;
    apiCalls: number;
  };
  usage?: {
    analyses: number;
    aiQuestions: number;
    exports: number;
    apiCalls: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      if (token && !authService.isTokenExpired()) {
        const userData = await authService.getProfile();
        setUser(userData);
      } else {
        authService.clearTokens();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      authService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const response = await authService.register({ email, password, name });
      
      if (response.success && response.session) {
        // Sauvegarder les tokens
        localStorage.setItem('ecolojia_token', response.session.token);
        localStorage.setItem('ecolojia_refresh_token', response.session.refreshToken);
        
        if (response.user) {
          setUser(response.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};