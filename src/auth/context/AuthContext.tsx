// frontend/src/auth/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '../types/AuthTypes';

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Interface pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// ✅ EXPORT PRINCIPAL - AuthProvider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialisation - vérifier utilisateur déjà connecté OU mode démo
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // ✅ PRIORITÉ 1: Vérifier mode démo d'abord
        const demoMode = localStorage.getItem('ecolojia_demo_mode');
        const demoUser = localStorage.getItem('ecolojia_demo_user');
        const demoToken = localStorage.getItem('ecolojia_demo_token');
        
        if (demoMode === 'true' && demoUser && demoToken) {
          try {
            console.log('🎭 Mode démo détecté - Chargement utilisateur fictif');
            const user = JSON.parse(demoUser);
            
            // Validation basique structure user demo
            if (user.id && user.email && user.name && user.tier) {
              setUser(user);
              setIsAuthenticated(true);
              setIsDemoMode(true);
              console.log('✅ Utilisateur démo initialisé:', user.name);
              return; // Sortir, pas besoin de vérifier token réel
            } else {
              console.warn('⚠️ Structure utilisateur démo invalide');
              clearDemoData();
            }
          } catch (error) {
            console.error('❌ Erreur parsing utilisateur démo:', error);
            clearDemoData();
          }
        }
        
        // ✅ PRIORITÉ 2: Authentification réelle si pas en mode démo
        const realToken = authService.getToken();
        
        if (realToken && !authService.isTokenExpired()) {
          console.log('🔐 Token réel détecté - Récupération profil utilisateur');
          try {
            const userData = await authService.getProfile();
            setUser(userData);
            setIsAuthenticated(true);
            setIsDemoMode(false);
            console.log('✅ Utilisateur réel connecté:', userData.name);
          } catch (profileError) {
            console.warn('⚠️ Erreur récupération profil - Token probablement invalide');
            authService.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
            setIsDemoMode(false);
          }
        } else {
          // Token invalide/expiré ou absent
          if (realToken) {
            console.log('🕐 Token expiré - Suppression automatique');
            authService.clearTokens();
          }
          setUser(null);
          setIsAuthenticated(false);
          setIsDemoMode(false);
        }
        
      } catch (err) {
        console.error('❌ Erreur initialisation auth:', err);
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
  }, []);

  // Fonction utilitaire pour nettoyer données démo
  const clearDemoData = () => {
    try {
      localStorage.removeItem('ecolojia_demo_mode');
      localStorage.removeItem('ecolojia_demo_user');
      localStorage.removeItem('ecolojia_demo_token');
      localStorage.removeItem('ecolojia_demo_history');
      console.log('🧹 Données démo supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression données démo:', error);
    }
  };

  // Fonction de connexion (authentification réelle uniquement)
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      // Si en mode démo, forcer sortie avant connexion réelle
      if (isDemoMode) {
        console.log('🚪 Sortie mode démo pour connexion réelle');
        clearDemoData();
        setIsDemoMode(false);
      }

      console.log('🔐 Tentative connexion:', credentials.email);
      const response = await authService.login(credentials);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        console.log('✅ Connexion réussie:', response.user.name);
      }
    } catch (err: any) {
      console.error('❌ Erreur connexion:', err);
      setError(err.message || 'Erreur de connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription (authentification réelle uniquement)
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);

      // Si en mode démo, forcer sortie avant inscription réelle
      if (isDemoMode) {
        console.log('🚪 Sortie mode démo pour inscription réelle');
        clearDemoData();
        setIsDemoMode(false);
      }

      console.log('📝 Tentative inscription:', userData.email);
      await authService.register(userData);
      console.log('✅ Inscription réussie pour:', userData.email);
    } catch (err: any) {
      console.error('❌ Erreur inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion (mode démo ET réel)
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (isDemoMode) {
        console.log('🚪 Déconnexion mode démo');
        clearDemoData();
      } else {
        console.log('🚪 Déconnexion utilisateur réel');
        try {
          await authService.logout();
        } catch (err) {
          console.warn('⚠️ Erreur logout serveur (non critique):', err);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsDemoMode(false);
      setIsLoading(false);
      setError(null);
      console.log('✅ Déconnexion terminée');
    }
  };

  // Actualiser les données utilisateur
  const refreshUser = async (): Promise<void> => {
    try {
      if (isDemoMode) {
        console.log('🎭 Mode démo - Pas de refresh serveur nécessaire');
        // En mode démo, re-lire les données locales
        const demoUser = localStorage.getItem('ecolojia_demo_user');
        if (demoUser) {
          const user = JSON.parse(demoUser);
          setUser(user);
          console.log('✅ Utilisateur démo rafraîchi');
        }
        return;
      }
      
      if (isAuthenticated && authService.getToken()) {
        console.log('🔄 Refresh données utilisateur réel');
        const userData = await authService.getProfile();
        setUser(userData);
        console.log('✅ Données utilisateur rafraîchies');
      }
    } catch (err) {
      console.error('❌ Erreur refresh user:', err);
      // En cas d'erreur, déconnecter l'utilisateur
      await logout();
    }
  };

  // Effacer l'erreur
  const clearError = (): void => {
    setError(null);
  };

  // Vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('❌ Pas d\'utilisateur pour vérifier permission:', permission);
      return false;
    }
    
    // En mode démo, toutes permissions accordées (Premium fictif)
    if (isDemoMode) {
      console.log('🎭 Mode démo - Permission accordée:', permission);
      return true;
    }
    
    // Logique permissions pour utilisateurs réels
    switch (permission) {
      case 'unlimited_scans':
        return user.tier === 'premium';
      case 'ai_chat':
        return user.tier === 'premium';
      case 'export_data':
        return user.tier === 'premium';
      case 'advanced_analytics':
        return user.tier === 'premium';
      case 'api_access':
        return user.tier === 'premium';
      case 'basic_analysis':
        return true; // Tous utilisateurs
      default:
        console.warn('⚠️ Permission inconnue:', permission);
        return false;
    }
  };

  // Vérifications tier
  const isFreeTier = (): boolean => {
    if (!user) return true;
    if (isDemoMode) return false; // Demo = Premium
    return user.tier === 'free';
  };

  const isPremiumTier = (): boolean => {
    if (!user) return false;
    if (isDemoMode) return true; // Demo = Premium
    return user.tier === 'premium';
  };

  // ✅ NOUVELLES MÉTHODES MODE DÉMO
  const enterDemoMode = (): void => {
    console.log('🎭 Activation mode démo demandée');
    // Cette méthode est appelée depuis AuthPage après création données démo
    setIsDemoMode(true);
    
    // Re-déclencher l'initialisation pour charger données démo
    const demoUser = localStorage.getItem('ecolojia_demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setUser(user);
        setIsAuthenticated(true);
        console.log('✅ Mode démo activé avec utilisateur:', user.name);
      } catch (error) {
        console.error('❌ Erreur activation mode démo:', error);
        clearDemoData();
      }
    }
  };

  const exitDemoMode = async (): Promise<void> => {
    console.log('🚪 Sortie mode démo demandée');
    clearDemoData();
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    console.log('✅ Sortie mode démo terminée');
  };

  // Utilitaires quotas
  const getRemainingQuota = (type: 'scans' | 'aiQuestions' | 'exports' | 'apiCalls'): number => {
    if (!user) return 0;
    
    const quota = user.quotas[`${type}PerMonth`] || user.quotas[`${type}PerDay`] || 0;
    const used = user.currentUsage[
      type === 'aiQuestions' ? 'aiQuestionsToday' : 
      type === 'scans' ? 'scansThisMonth' :
      type === 'exports' ? 'exportsThisMonth' : 
      'apiCallsThisMonth'
    ] || 0;
    
    if (quota === -1) return -1; // Illimité
    return Math.max(0, quota - used);
  };

  const canPerformAction = (action: 'scan' | 'aiQuestion' | 'export' | 'apiCall'): boolean => {
    if (isDemoMode) return true; // Demo = tout autorisé
    
    const remaining = getRemainingQuota(
      action === 'scan' ? 'scans' :
      action === 'aiQuestion' ? 'aiQuestions' :
      action === 'export' ? 'exports' : 'apiCalls'
    );
    
    return remaining === -1 || remaining > 0;
  };

  // Méthodes de debugging
  const getAuthState = () => ({
    isAuthenticated,
    isDemoMode,
    userTier: user?.tier || 'none',
    userName: user?.name || 'none',
    hasToken: isDemoMode ? 'demo-token' : !!authService.getToken(),
    tokenExpired: isDemoMode ? false : authService.isTokenExpired()
  });

  const debugAuth = (): void => {
    console.log('🔍 État authentification:', getAuthState());
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    // État de base
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // État mode démo
    isDemoMode,
    
    // Actions authentification
    login,
    register,
    logout,
    clearError,
    refreshUser,
    
    // Actions mode démo
    enterDemoMode,
    exitDemoMode,
    
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

// ✅ EXPORT HOOK personnalisé
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth doit être utilisé à l\'intérieur d\'un AuthProvider. ' +
      'Assurez-vous que votre composant est wrappé dans <AuthProvider>.'
    );
  }
  
  return context;
};

// ✅ EXPORT du contexte par défaut
export default AuthContext;