// frontend/ecolojiaFrontV3/src/services/apiClient.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * ✅ Base URL depuis Vite (import.meta.env) avec fallback
 */
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ??
  (window as any)?.__ENV?.VITE_API_URL ??
  'https://ecolojia-backend-working.onrender.com';

/**
 * ✅ Création d'une instance Axios
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/**
 * ✅ Intercepteur requêtes : ajoute le bon token
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('ecolojia_token');
    const demoToken = localStorage.getItem('ecolojia_demo_token');

    // Heuristique simple : si l'URL contient "demo", utiliser le token démo
    if (demoToken && config.url?.includes('demo')) {
      config.headers = { ...config.headers, Authorization: `Bearer ${demoToken}` };
    } else if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }

    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ Intercepteur réponses : gestion des erreurs et 401
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Tokens réels invalides → purge & redirection (sauf mode démo)
        const isDemoMode = localStorage.getItem('ecolojia_demo_mode') === 'true';
        localStorage.removeItem('ecolojia_token');
        localStorage.removeItem('ecolojia_refresh_token');

        if (!isDemoMode) {
          // éviter boucle infinie si déjà sur /auth
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      } else if (status === 403) {
        console.error('🚫 Accès interdit (403)');
      } else if (status === 404) {
        console.error('🔎 Ressource non trouvée (404)');
      } else if (status >= 500) {
        console.error('💥 Erreur serveur (>=500)');
      }
    } else if (error.request) {
      console.error('📡 Pas de réponse du serveur');
    } else {
      console.error('⚙️ Erreur configuration requête:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * ✅ Utilitaire : est-ce qu'un token réel est présent ?
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ecolojia_token');
  return Boolean(token);
};

export default apiClient;