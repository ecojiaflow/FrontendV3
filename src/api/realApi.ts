import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecolojia-backend-working.onrender.com';

// Types pour Analyse IA
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
// Axios Configuration
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
