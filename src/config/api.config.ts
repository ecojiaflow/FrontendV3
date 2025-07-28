// frontend/src/config/api.config.ts

// Configuration intelligente qui détecte automatiquement l'environnement
const getApiUrl = () => {
  // Si on est en localhost, utiliser le backend local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🏠 Mode développement détecté - Utilisation du backend local');
    return 'http://localhost:3000/api';
  }
  
  // Sinon, utiliser le backend de production
  console.log('🌐 Mode production détecté - Utilisation du backend Render');
  return 'https://ecolojia-backend-working.onrender.com/api';
};

// Vérifier d'abord VITE_API_URL dans l'environnement
const apiUrl = import.meta.env.VITE_API_URL || getApiUrl();

export const API_CONFIG = {
  // URL de l'API qui s'adapte automatiquement
  API_URL: apiUrl,
  
  // Autres configurations
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  
  // Helper pour savoir si on est en dev
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Helper pour obtenir l'URL actuelle
  getCurrentApiUrl: () => {
    console.log('📡 API URL active:', apiUrl);
    return apiUrl;
  }
};

// Log au chargement
console.log('🔧 Configuration API chargée:', {
  hostname: window.location.hostname,
  isDev: API_CONFIG.isDevelopment,
  apiUrl: API_CONFIG.API_URL,
  envUrl: import.meta.env.VITE_API_URL
});

// Export par défaut de l'URL
export const API_URL = API_CONFIG.API_URL;