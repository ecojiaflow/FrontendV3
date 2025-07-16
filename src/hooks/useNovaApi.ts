// PATH: frontend/src/hooks/useNovaApi.ts
import { useState, useCallback } from 'react';

export interface AnalysisRequest {
  title: string;
  brand?: string;
  description?: string;
  ingredients?: string[];
  detected_type?: 'food' | 'cosmetic' | 'detergent' | string;
}

interface NovaApiState<T = any> {
  loading: boolean;
  error: string | null;
  result: T | null;
  analyze: (payload: AnalysisRequest) => Promise<void>;
}

export function useNovaApi(): NovaApiState {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<any | null>(null);

  const analyze = useCallback(async (payload: AnalysisRequest) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const API_URL =
        import.meta.env.VITE_API_URL ??
        'https://ecolojia-backend-working.onrender.com/api/analyze/auto';

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error: err = res.statusText } = await res.json().catch(() => ({}));
        throw new Error(err);
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      console.error('useNovaApi - analyze error:', e);
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, analyze };
}

/* -------------------------------------------------------------------------- */
/* ✅ FONCTION MOCK pour compatibilité avec Results.tsx                        */
/* -------------------------------------------------------------------------- */

export function useQuickNovaTest() {
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      detected_type: 'food',
      category: 'Alimentaire',
      analysis: {
        overall_score: 73,
        transformation: 42,
        additives: ['E250', 'E202'],
      },
      metadata: {
        mock: true,
        confidence: 0.91,
        source: 'mock-local',
        timestamp: new Date().toISOString(),
      },
    };
  };
}

export default useNovaApi;
// EOF
