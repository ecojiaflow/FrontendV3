// frontend/src/auth/types/AuthTypes.ts

// ===== INTERFACES UTILISATEUR =====

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
  
  // Quotas utilisateur
  quotas: UserQuotas;
  
  // Usage actuel
  currentUsage: UserUsage;
  
  // Infos abonnement (optionnel)
  subscription?: UserSubscription;
  
  // Préférences utilisateur (optionnel)
  preferences?: UserPreferences;
}

export interface UserQuotas {
  scansPerMonth: number; // -1 = illimité
  aiQuestionsPerDay: number; // -1 = illimité
  exportsPerMonth: number; // -1 = illimité
  apiCallsPerMonth: number; // -1 = illimité
}

export interface UserUsage {
  scansThisMonth: number;
  aiQuestionsToday: number;
  exportsThisMonth: number;
  apiCallsThisMonth: number;
}

export interface UserSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  plan?: {
    id: string;
    name: string;
    amount: number;
    currency: string;
  };
}

export interface UserPreferences {
  // Préférences générales
  language: 'fr' | 'en' | 'es' | 'it';
  theme: 'light' | 'dark' | 'auto';
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  
  // Objectifs santé
  goals?: string[]; // ['weight_management', 'skin_health', 'eco_friendly', etc.]
  
  // Restrictions alimentaires/cosmétiques
  allergies?: string[]; // ['nuts', 'gluten', 'lactose', etc.]
  skinType?: 'sensitive' | 'normal' | 'oily' | 'dry' | 'combination';
  
  // Préférences analyse
  preferredCategories?: string[]; // ['food', 'cosmetics', 'detergents']
  showScientificDetails: boolean;
  autoScanMode: boolean;
}

// ===== INTERFACES FORMULAIRES =====

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

// ===== INTERFACES REQUÊTES API =====

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptMarketing?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

// ===== INTERFACES RÉPONSES API =====

export interface AuthResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  errors?: Record<string, string[]>; // Erreurs validation détaillées
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
  tokenType: 'Bearer';
}

export interface RegisterResponse {
  message: string;
  requiresEmailVerification: boolean;
  user?: Partial<User>; // Données basiques si pas de vérification
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

export interface ProfileResponse {
  user: User;
}

// ===== INTERFACE CONTEXTE AUTH =====

export interface AuthContextType {
  // ===== ÉTAT DE BASE =====
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // ===== ÉTAT MODE DÉMO =====
  isDemoMode: boolean;
  
  // ===== ACTIONS AUTHENTIFICATION =====
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  
  // Actions auth avancées
  resetPassword?: (email: string) => Promise<void>;
  confirmPasswordReset?: (token: string, newPassword: string) => Promise<void>;
  changePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile?: (data: UpdateProfileRequest) => Promise<void>;
  deleteAccount?: () => Promise<void>;
  
  // ===== ACTIONS MODE DÉMO =====
  enterDemoMode: () => void;
  exitDemoMode: () => Promise<void>;
  
  // ===== UTILITAIRES PERMISSIONS =====
  hasPermission: (permission: string) => boolean;
  isFreeTier: () => boolean;
  isPremiumTier: () => boolean;
  
  // ===== UTILITAIRES QUOTAS =====
  getRemainingQuota: (type: 'scans' | 'aiQuestions' | 'exports' | 'apiCalls') => number;
  canPerformAction: (action: 'scan' | 'aiQuestion' | 'export' | 'apiCall') => boolean;
  
  // Gestion quotas avancée
  incrementUsage?: (type: 'scans' | 'aiQuestions' | 'exports' | 'apiCalls') => Promise<void>;
  getQuotaStatus?: () => QuotaStatus;
  
  // ===== UTILITAIRES DEBUG =====
  debugAuth: () => void;
  getAuthState: () => AuthDebugState;
}

// ===== INTERFACES UTILITAIRES =====

export interface QuotaStatus {
  scans: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  };
  aiQuestions: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  };
  exports: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  };
  apiCalls: {
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  };
}

export interface AuthDebugState {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  userTier: string;
  userName: string;
  hasToken: boolean | string;
  tokenExpired: boolean;
}

// ===== TYPES ENUMS =====

export type UserTier = 'free' | 'premium';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired';

export type NotificationType = 
  | 'email' 
  | 'push' 
  | 'in_app';

export type PermissionType = 
  | 'unlimited_scans'
  | 'ai_chat'
  | 'export_data'
  | 'advanced_analytics'
  | 'api_access'
  | 'basic_analysis'
  | 'premium_features';

// ===== CLASSES D'ERREURS =====

export class ApiError extends Error {
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

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Non authentifié') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Non autorisé') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string = 'Données invalides', 
    errors?: Record<string, string[]>
  ) {
    super(message, 422, 'VALIDATION_ERROR', errors);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Erreur réseau') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// ===== DONNÉES DÉMO =====

export interface DemoData {
  user: User;
  token: string;
  history: DemoAnalysisHistoryItem[];
  createdAt: string;
}

export interface DemoAnalysisHistoryItem {
  id: string;
  productName: string;
  brand?: string;
  category: 'food' | 'cosmetics' | 'detergents';
  healthScore: number;
  healthCategory: 'excellent' | 'bon' | 'moyen' | 'mauvais' | 'très_mauvais';
  scannedAt: string;
  barcode?: string;
  keyFindings: string[];
  recommendations?: string[];
}

// ===== UTILITAIRES VALIDATION =====

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormValidationRules {
  email: ValidationRule;
  password: ValidationRule;
  name: ValidationRule;
  confirmPassword: ValidationRule;
}

// ===== CONSTANTES =====

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'ecolojia_token',
  REFRESH_TOKEN: 'ecolojia_refresh_token',
  DEMO_MODE: 'ecolojia_demo_mode',
  DEMO_USER: 'ecolojia_demo_user',
  DEMO_TOKEN: 'ecolojia_demo_token',
  DEMO_HISTORY: 'ecolojia_demo_history',
  USER_PREFERENCES: 'ecolojia_user_preferences'
} as const;

export const DEFAULT_USER_QUOTAS: UserQuotas = {
  scansPerMonth: 30,
  aiQuestionsPerDay: 5,
  exportsPerMonth: 0,
  apiCallsPerMonth: 0
};

export const PREMIUM_USER_QUOTAS: UserQuotas = {
  scansPerMonth: -1, // Illimité
  aiQuestionsPerDay: -1, // Illimité
  exportsPerMonth: 10,
  apiCallsPerMonth: 1000
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'fr',
  theme: 'light',
  emailNotifications: true,
  pushNotifications: false,
  weeklyReport: true,
  goals: [],
  allergies: [],
  preferredCategories: ['food'],
  showScientificDetails: false,
  autoScanMode: true
};

// ===== GUARDS DE TYPE =====

export function isUser(value: any): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.name === 'string' &&
    (value.tier === 'free' || value.tier === 'premium')
  );
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Au moins 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}