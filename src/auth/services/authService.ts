// frontend/src/auth/services/authService.ts

import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  LoginResponse, 
  RegisterResponse,
  User
} from '../types/AuthTypes';

// ✅ CRÉATION LOCAL DES CLASSES D'ERREURS (évite problèmes import)
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class AuthService {
  private baseURL: string;
  private tokenKey = 'ecolojia_token';
  private refreshTokenKey = 'ecolojia_refresh_token';

  constructor() {
    // ✅ CORRECTION: URL backend ou fallback localhost
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // ===== AUTHENTICATION METHODS =====

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.makeRequest<AuthResponse<LoginResponse>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (response.success && response.data) {
        // Stocker les tokens
        this.setToken(response.data.token);
        if (response.data.refreshToken) {
          this.setRefreshToken(response.data.refreshToken);
        }
        
        return response.data;
      }

      throw new ApiError(response.message || 'Erreur de connexion');
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.makeRequest<AuthResponse<RegisterResponse>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new ApiError(response.message || 'Erreur lors de l\'inscription');
    } catch (error) {
      console.error('Register error:', error);
      throw this.handleError(error);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.makeRequest<AuthResponse<{ user: User }>>('/auth/profile', {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.success && response.data) {
        return response.data.user;
      }

      throw new ApiError('Impossible de récupérer le profil');
    } catch (error) {
      console.error('Get profile error:', error);
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.getToken() || this.isTokenExpired()) {
        return null;
      }
      
      return await this.getProfile();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // ✅ Tentative de logout côté serveur (non critique)
        try {
          await this.makeRequest('/auth/logout', {
            method: 'POST',
            headers: this.getAuthHeaders()
          });
        } catch (logoutError) {
          console.warn('Erreur logout serveur (non critique):', logoutError);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continuer même en cas d'erreur pour nettoyer localement
    } finally {
      this.clearTokens();
    }
  }

  // ===== TOKEN MANAGEMENT =====

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch {
      return null;
    }
  }

  setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('Erreur sauvegarde refresh token:', error);
    }
  }

  clearTokens(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.error('Erreur suppression tokens:', error);
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  // ===== PRIVATE METHODS =====

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const config: RequestInit = {
      ...options,
      headers: defaultHeaders
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}` };
        }
        
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Erreur réseau ou autre
      console.error('Erreur réseau:', error);
      throw new ApiError(
        'Impossible de contacter le serveur. Vérifiez votre connexion.',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(error.message);
    }

    return new ApiError('Une erreur inattendue s\'est produite');
  }
}

// Export singleton
export const authService = new AuthService();
export default authService;