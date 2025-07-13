import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecolojia-backend-working.onrender.com';

// ==============================
// Types
// ==============================

export interface AnalyzeRequest {
  product_name: string;
  ingredients?: string;
  description?: string;
  images?: string[];
}

export interface AnalyzeResponse {
  auto_detection: {
    detected_type: 'food' | 'cosmetic' | 'detergent';
    confidence: number;
    reasoning: string;
  };
  analysis: {
    score: number;
    nova_group?: number;
    additives?: string[];
    glycemic_index?: number;
    breakdown: {
      environmental: number;
      health: number;
      social: number;
      processing: number;
    };
  };
  alternatives: Array<{
    name: string;
    score: number;
    benefits: string;
    source: string;
    type: 'diy' | 'product' | 'natural';
    price?: number;
    where_to_buy?: string;
  }>;
  insights: Array<{
    type: 'warning' | 'education' | 'tip';
    title: string;
    content: string;
    impact?: string;
    source?: string;
  }>;
  affiliate_links?: Array<{
    partner: string;
    product: string;
    price: number;
    commission: number;
    url: string;
  }>;
}

export interface ChatRequest {
  message: string;
  product_context?: {
    id: string;
    name: string;
    analysis: any;
  };
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
  suggestions?: string[];
}

export interface QuotaResponse {
  remaining_analyses: number;
  remaining_chat: number;
  plan: 'free' | 'premium';
  reset_date: string;
}

// ➕ NOUVEAUX TYPES QUOTA DÉTAILLÉ
export interface DetailedQuotaData {
  used_analyses: number;
  remaining_analyses: number;
  daily_limit: number;
  reset_time: string;
  current_date: string;
}

export interface DetailedQuotaResponse {
  success: boolean;
  quota: DetailedQuotaData;
  error?: string;
}

// ==============================
// Axios configuration
// ==============================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecolojia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const anon = localStorage.getItem('ecolojia_anonymous_id') || generateAnonId();
    localStorage.setItem('ecolojia_anonymous_id', anon);
    config.headers['X-Anonymous-ID'] = anon;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 429) throw new Error('QUOTA_EXCEEDED');
    if (err.response?.status === 422) throw new Error('LOW_CONFIDENCE');
    if (err.response?.status === 401) {
      localStorage.removeItem('ecolojia_token');
      throw new Error('UNAUTHORIZED');
    }
    throw err;
  }
);

function generateAnonId(): string {
  return 'anon_' + Math.random().toString(36).substring(2, 11) + Date.now();
}

// ==============================
// Fonctions API principales
// ==============================

const analyzeAuto = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const res: AxiosResponse<AnalyzeResponse> = await apiClient.post('/api/analyze/auto', request);
  return res.data;
};

const chatWithAI = async (request: ChatRequest): Promise<ChatResponse> => {
  const res: AxiosResponse<ChatResponse> = await apiClient.post('/api/chat/message', request);
  return res.data;
};

const getUserQuota = async (): Promise<QuotaResponse> => {
  try {
    const res: AxiosResponse<QuotaResponse> = await apiClient.get('/api/user/quota');
    return res.data;
  } catch {
    return {
      remaining_analyses: 10,
      remaining_chat: 5,
      plan: 'free',
      reset_date: new Date(Date.now() + 86400000).toISOString(),
    };
  }
};

// ➕ NOUVELLE FONCTION QUOTA DÉTAILLÉ
const fetchUserQuota = async (): Promise<DetailedQuotaResponse> => {
  try {
    console.log('📊 Récupération quota utilisateur détaillé...');
    
    const res: AxiosResponse<DetailedQuotaResponse> = await apiClient.get('/api/user/quota');
    console.log('✅ Quota détaillé récupéré:', res.data);
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Erreur récupération quota détaillé:', error);
    
    // Quota de fallback en cas d'erreur
    const fallbackQuota: DetailedQuotaResponse = {
      success: false,
      error: error?.message || 'Erreur quota',
      quota: {
        used_analyses: 0,
        remaining_analyses: 10,
        daily_limit: 10,
        reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        current_date: new Date().toISOString().split('T')[0]
      }
    };
    
    return fallbackQuota;
  }
};

// ➕ FONCTION RAFRAÎCHISSEMENT QUOTA
const refreshQuotaAfterAnalysis = async (): Promise<DetailedQuotaResponse> => {
  // Petite pause pour laisser le backend mettre à jour
  await new Promise(resolve => setTimeout(resolve, 500));
  return fetchUserQuota();
};

// ➕ FONCTION VÉRIFICATION QUOTA
const canUserAnalyze = async (): Promise<boolean> => {
  try {
    const quotaResponse = await fetchUserQuota();
    return quotaResponse.success && quotaResponse.quota.remaining_analyses > 0;
  } catch {
    return true; // En cas d'erreur, on autorise (mode dégradé)
  }
};

const trackAffiliateClick = async (payload: {
  product_id: string;
  partner: string;
  product_name: string;
  price: number;
  commission: number;
}): Promise<void> => {
  try {
    await apiClient.post('/api/track/click', payload);
  } catch (err) {
    console.warn('Erreur tracking affilié:', err);
  }
};

// ==============================
// Produits – Fonctions additionnelles
// ==============================

interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  description?: string;
  eco_score: string;
  ai_confidence: string;
  confidence_pct?: number;
  confidence_color?: string;
  verified_status?: string;
  tags?: string[];
  zones_dispo?: string[];
  image_url?: string;
  prices?: any;
  resume_fr?: string;
}

export interface Product {
  id: string;
  nameKey: string;
  brandKey?: string;
  descriptionKey: string;
  ethicalScore: number;
  category: string;
  price: number;
  currency: string;
  image: string;
  tagsKeys: string[];
  verified: boolean;
  affiliateLink: string;
  certificationsKeys: string[];
  aiConfidence: number;
  zonesDisponibles: string[];
  slug: string;
  resumeFr?: string;
  confidencePct?: number;
  confidenceColor?: string;
  verifiedStatus?: string;
}

function adaptBackendToFrontend(p: BackendProduct): Product {
  return {
    id: p.id,
    nameKey: p.title || 'Produit inconnu',
    brandKey: p.brand || '',
    descriptionKey: p.description || p.resume_fr || '',
    ethicalScore: parseFloat(p.eco_score) || 0,
    category: p.category || 'inconnu',
    price: p.prices?.default || 0,
    currency: 'EUR',
    image: p.image_url || 'https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6',
    tagsKeys: p.tags || [],
    verified: p.verified_status === 'verified' || p.verified_status === 'ai_verified',
    affiliateLink: '',
    certificationsKeys: [],
    aiConfidence: parseFloat(p.ai_confidence) || 0,
    zonesDisponibles: p.zones_dispo || ['FR'],
    slug: p.slug,
    resumeFr: p.resume_fr,
    confidencePct: p.confidence_pct,
    confidenceColor: p.confidence_color,
    verifiedStatus: p.verified_status,
  };
}

const fetchRealProducts = async (searchQuery: string = ''): Promise<Product[]> => {
  try {
    console.log('🔍 Recherche produits:', searchQuery ? `"${searchQuery}"` : 'tous les produits');
    
    const url = searchQuery
      ? `/api/products/search?q=${encodeURIComponent(searchQuery)}`
      : '/api/products';
    
    const res = await apiClient.get(url);
    console.log('📦 Réponse API produits:', res.data);
    
    const data = Array.isArray(res.data) ? res.data : res.data.products || [];
    const products = data.map(adaptBackendToFrontend);
    
    console.log(`✅ ${products.length} produits traités`);
    return products;
  } catch (error) {
    console.error('❌ Erreur fetchRealProducts:', error);
    return [];
  }
};

const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    console.log('🔍 Recherche produit par slug:', slug);
    
    const res = await apiClient.get(`/api/products/${slug}`);
    const product = adaptBackendToFrontend(res.data);
    
    console.log('✅ Produit trouvé:', product);
    return product;
  } catch (err) {
    console.warn('⚠️ Produit non trouvé:', slug);
    return null;
  }
};

// ==============================
// EXPORTS EXPLICITES - SOLUTION AU PROBLÈME
// ==============================

export {
  // Fonctions d'analyse
  analyzeAuto,
  
  // Fonctions de chat
  chatWithAI,
  
  // Fonctions de quota
  getUserQuota,
  fetchUserQuota,
  refreshQuotaAfterAnalysis,
  canUserAnalyze,
  
  // Fonctions de tracking
  trackAffiliateClick,
  
  // Fonctions de produits - LES IMPORTANTES POUR HOMEPAGE
  fetchRealProducts,
  fetchProductBySlug
};

// Export par défaut pour compatibilité
export default {
  analyzeAuto,
  chatWithAI,
  getUserQuota,
  fetchUserQuota,
  refreshQuotaAfterAnalysis,
  canUserAnalyze,
  trackAffiliateClick,
  fetchRealProducts,
  fetchProductBySlug
};