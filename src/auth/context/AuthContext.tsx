// frontend/src/auth/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '../types/AuthTypes';
import { demoService } from '../../services/demoService';

// CrÃ©ation du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Interface pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// âœ… EXPORT PRINCIPAL - AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fonction utilitaire pour nettoyer donnÃ©es dÃ©mo
  const clearDemoData = useCallback(() => {
    try {
      localStorage.removeItem('ecolojia_demo_mode');
      localStorage.removeItem('ecolojia_demo_user');
      localStorage.removeItem('ecolojia_demo_token');
      localStorage.removeItem('ecolojia_demo_history');
      console.log('ðŸ§¹ DonnÃ©es dÃ©mo supprimÃ©es');
    } catch (error) {
      console.error('âŒ Erreur suppression donnÃ©es dÃ©mo:', error);
    }
  }, []);

  // Initialisation - vÃ©rifier utilisateur dÃ©jÃ  connectÃ© OU mode dÃ©mo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // âœ… PRIORITÃ‰ 1: VÃ©rifier mode dÃ©mo d'abord
        if (demoService.isDemoActive()) {
          console.log('ðŸŽ­ Mode dÃ©mo dÃ©tectÃ©');
          const demoSession = demoService.getCurrentSession();
          
          if (demoSession) {
            setUser(demoSession.user);
            setIsAuthenticated(true);
            setIsDemoMode(true);
            console.log('âœ… Utilisateur dÃ©mo initialisÃ©:', demoSession.user.name);
            return; // Sortir, pas besoin de vÃ©rifier token rÃ©el
          } else {
            console.warn('âš ï¸ Session dÃ©mo invalide');
            clearDemoData();
          }
        }
        
        // âœ… PRIORITÃ‰ 2: Authentification rÃ©elle si pas en mode dÃ©mo
        const realToken = authService.getToken();
        
        if (realToken && !authService.isTokenExpired()) {
          console.log('ðŸ” Token rÃ©el dÃ©tectÃ© - RÃ©cupÃ©ration profil utilisateur');
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            setIsDemoMode(false);
            console.log('âœ… Utilisateur rÃ©el connectÃ©:', userData.name);
          } catch (profileError) {
            console.warn('âš ï¸ Erreur rÃ©cupÃ©ration profil - Token probablement invalide');
            authService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            setIsDemoMode(false);
          }
        } else {
          // Token invalide/expirÃ© ou absent
          if (realToken) {
            console.log('ðŸ• Token expirÃ© - Suppression automatique');
            authService.clearTokens();
          }
          setUser(null);
          setIsAuthenticated(false);
          setIsDemoMode(false);
        }
        
      } catch (err) {
        console.error('âŒ Erreur initialisation auth:', err);
        // En cas d'erreur, reset complet
        authService.clearTokens();
        clearDemoData();
        setUser(null);
        setIsAuthenticated(false);
        setIsDemoMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [clearDemoData]);

  // Fonction de connexion (authentification rÃ©elle uniquement)
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      // Si en mode dÃ©mo, forcer sortie avant connexion rÃ©elle
      if (isDemoMode) {
        console.log('ðŸšª Sortie mode dÃ©mo pour connexion rÃ©elle');
        demoService.endDemoSession();
        setIsDemoMode(false);
      }

      console.log('ðŸ” Tentative connexion:', credentials.email);
      const response = await authService.login(credentials);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        console.log('âœ… Connexion rÃ©ussie:', response.user.name);
      }
    } catch (err: any) {
      console.error('âŒ Erreur connexion:', err);
      setError(err.message || 'Erreur de connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  // Fonction d'inscription (authentification rÃ©elle uniquement)
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      // Si en mode dÃ©mo, forcer sortie avant inscription rÃ©elle
      if (isDemoMode) {
        console.log('ðŸšª Sortie mode dÃ©mo pour inscription rÃ©elle');
        demoService.endDemoSession();
        setIsDemoMode(false);
      }

      console.log('ðŸ“ Tentative inscription:', userData.email);
      await authService.register(userData);
      console.log('âœ… Inscription rÃ©ussie pour:', userData.email);
    } catch (err: any) {
      console.error('âŒ Erreur inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  // Fonction de dÃ©connexion (mode dÃ©mo ET rÃ©el)
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        console.log('ðŸšª DÃ©connexion mode dÃ©mo');
        demoService.endDemoSession();
      } else {
        console.log('ðŸšª DÃ©connexion utilisateur rÃ©el');
        try {
          await authService.logout();
        } catch (err) {
          console.warn('âš ï¸ Erreur logout serveur (non critique):', err);
        }
      }
    } catch (error) {
      console.error('âŒ Erreur lors de la dÃ©connexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      setIsLoading(false);
      setError(null);
      console.log('âœ… DÃ©connexion terminÃ©e');
    }
  }, [isDemoMode]);

  // âœ… NOUVELLE MÃ‰THODE DÃ‰MARER SESSION DÃ‰MO
  const startDemoSession = useCallback(async (tier: 'free' | 'premium' = 'premium'): Promise<void> => {
    try {
      console.log(`ðŸŽ­ DÃ©marrage session dÃ©mo ${tier}`);
      
      // Si dÃ©jÃ  connectÃ© (rÃ©el), dÃ©connecter d'abord
      if (isAuthenticated && !isDemoMode) {
        authService.clearTokens();
      }
      
      // CrÃ©er session dÃ©mo
      const demoSession = demoService.startDemoSession(tier);
      
      // Mettre Ã  jour Ã©tat
      setUser(demoSession.user);
      setIsAuthenticated(true);
      setIsDemoMode(true);
      setError(null);
      
      console.log('âœ… Session dÃ©mo dÃ©marrÃ©e:', demoSession.user.name);
    } catch (error) {
      console.error('âŒ Erreur dÃ©marrage session dÃ©mo:', error);
      throw new Error('Impossible de dÃ©marrer le mode dÃ©mo');
    }
  }, [isAuthenticated, isDemoMode]);

  // Actualiser les donnÃ©es utilisateur
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (isDemoMode) {
        console.log('ðŸŽ­ Mode dÃ©mo - Refresh des donnÃ©es dÃ©mo');
        const demoSession = demoService.getCurrentSession();
        if (demoSession) {
          setUser(demoSession.user);
          console.log('âœ… Utilisateur dÃ©mo rafraÃ®chi');
        }
        return;
      }
      
      if (isAuthenticated && authService.getToken()) {
        console.log('ðŸ”„ Refresh donnÃ©es utilisateur rÃ©el');
        const userData = await authService.getProfile();
        setUser(userData);
        console.log('âœ… DonnÃ©es utilisateur rafraÃ®chies');
      }
    } catch (err) {
      console.error('âŒ Erreur refresh user:', err);
      // En cas d'erreur, dÃ©connecter l'utilisateur
      await logout();
    }
  }, [isDemoMode, isAuthenticated, logout]);

  // Effacer l'erreur
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // VÃ©rifier les permissions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) {
      console.log('âŒ Pas d\'utilisateur pour vÃ©rifier permission:', permission);
      return false;
    }
    
    // En mode dÃ©mo, permissions selon tier
    if (isDemoMode) {
      console.log(`ðŸŽ­ Mode dÃ©mo ${user.tier} - Permission ${permission}`);
      switch (permission) {
        case 'unlimited_scans':
        case 'ai_chat':
        case 'export_data':
        case 'advanced_analytics':
        case 'api_access':
          return user.tier === 'premium';
        case 'basic_analysis':
          return true;
        default:
          return false;
      }
    }
    
    // Logique permissions pour utilisateurs rÃ©els
    switch (permission) {
      case 'unlimited_scans':
      case 'ai_chat':
      case 'export_data':
      case 'advanced_analytics':
      case 'api_access':
        return user.tier === 'premium';
      case 'basic_analysis':
        return true;
      default:
        console.warn('âš ï¸ Permission inconnue:', permission);
        return false;
    }
  }, [user, isDemoMode]);

  // VÃ©rifications tier
  const isFreeTier = useCallback((): boolean => {
    if (!user) return true;
    return user.tier === 'free';
  }, [user]);

  const isPremiumTier = useCallback((): boolean => {
    if (!user) return false;
    return user.tier === 'premium';
  }, [user]);

  // Utilitaires quotas
  const getRemainingQuota = useCallback((type: 'scans' | 'aiQuestions' | 'exports' | 'apiCalls'): number => {
    if (!user) return 0;
    
    if (isDemoMode) {
      const demoSession = demoService.getCurrentSession();
      if (demoSession) {
        const quota = demoSession.quotas[type];
        if (quota.limit === -1) return -1; // IllimitÃ©
        return Math.max(0, quota.limit - quota.used);
      }
      return 0;
    }
    
    // Logique quotas rÃ©els
    const quota = user.quotas[`${type}PerMonth`] || user.quotas[`${type}PerDay`] || 0;
    const used = user.currentUsage[
      type === 'aiQuestions' ? 'aiQuestionsToday' : 
      type === 'scans' ? 'scansThisMonth' :
      type === 'exports' ? 'exportsThisMonth' : 
      'apiCallsThisMonth'
    ] || 0;
    
    if (quota === -1) return -1; // IllimitÃ©
    return Math.max(0, quota - used);
  }, [user, isDemoMode]);

  const canPerformAction = useCallback((action: 'scan' | 'aiQuestion' | 'export' | 'apiCall'): boolean => {
    const remaining = getRemainingQuota(
      action === 'scan' ? 'scans' :
      action === 'aiQuestion' ? 'aiQuestions' :
      action === 'export' ? 'exports' : 'apiCalls'
    );
    
    return remaining === -1 || remaining > 0;
  }, [getRemainingQuota]);

  // MÃ©thodes de debugging
  const getAuthState = useCallback(() => ({
    isAuthenticated,
    isDemoMode,
    userTier: user?.tier || 'none',
    userName: user?.name || 'none',
    hasToken: isDemoMode ? 'demo-token' : !!authService.getToken(),
    tokenExpired: isDemoMode ? false : authService.isTokenExpired()
  }), [isAuthenticated, isDemoMode, user]);

  const debugAuth = useCallback((): void => {
    console.log('ðŸ” Ã‰tat authentification:', getAuthState());
  }, [getAuthState]);

  // Valeur du contexte
  const contextValue: AuthContextType = {
    // Ã‰tat de base
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Ã‰tat mode dÃ©mo
    isDemoMode,
    
    // Actions authentification
    login,
    register,
    logout,
    clearError,
    refreshUser,
    
    // Actions mode dÃ©mo
    startDemoSession,
    
    // Utilitaires permissions
    hasPermission,
    isFreeTier,
    isPremiumTier,
    
    // Utilitaires quotas
    getRemainingQuota,
    canPerformAction,
    
    // Debug
    debugAuth,
    getAuthState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// âœ… EXPORT HOOK personnalisÃ©
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth doit Ãªtre utilisÃ© Ã  l\'intÃ©rieur d\'un AuthProvider. ' +
      'Assurez-vous que votre composant est wrappÃ© dans <AuthProvider>.'
    );
  }
  
  return context;
};

// âœ… EXPORT du contexte par dÃ©faut
export default AuthContext;/ /   I m p l e m e n t a t i o n   c o m p l e t e d   0 7 / 2 3 / 2 0 2 5   2 1 : 3 4 : 5 9  
 

