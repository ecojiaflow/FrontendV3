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

export const analyzeAuto = async (request: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const res: AxiosResponse<AnalyzeResponse> = await apiClient.post('/api/analyze/auto', request);
  return res.data;
};

export const chatWithAI = async (request: ChatRequest): Promise<ChatResponse> => {
  const res: AxiosResponse<ChatResponse> = await apiClient.post('/api/chat/message', request);
  return res.data;
};

export const getUserQuota = async (): Promise<QuotaResponse> => {
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

export const trackAffiliateClick = async (payload: {
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

export const fetchRealProducts = async (searchQuery: string = ''): Promise<Product[]> => {
  const url = searchQuery
    ? `/api/products/search?q=${encodeURIComponent(searchQuery)}`
    : '/api/products';
  const res = await apiClient.get(url);
  const data = Array.isArray(res.data) ? res.data : res.data.products || [];
  return data.map(adaptBackendToFrontend);
};

export const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const res = await apiClient.get(`/api/products/${slug}`);
    return adaptBackendToFrontend(res.data);
  } catch (err) {
    console.warn('Produit non trouvé:', slug);
    return null;
  }
};
