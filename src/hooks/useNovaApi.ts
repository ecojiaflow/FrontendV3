// PATH: frontend/src/hooks/useNovaApi.ts
// Hook universel pour appeler l’API NOVA (alimentaire) ET les futures
// catégories (cosmetics, detergents).  ➜ Export NOMMÉ **et** export par défaut
// -----------------------------------------------------------------------------

import { useState, useCallback } from 'react';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

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
  /** Lance l’analyse IA */
  analyze: (payload: AnalysisRequest) => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*                              HOOK PRINCIPAL                               */
/* -------------------------------------------------------------------------- */

export function useNovaApi(): NovaApiState {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<any | null>(null);

  /** Envoi la requête d’analyse à l’API ou mock fallback */
  const analyze = useCallback(async (payload: AnalysisRequest) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      /* ------------------------------ Endpoint ------------------------------ */
      const API_URL =
        import.meta.env.VITE_API_URL ??
        'https://ecolojia-backend-working.onrender.com/api/analyze/auto';

      /* ----------------------------- Requête ------------------------------ */
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
/*                    EXPORT PAR DÉFAUT (compatibilité V1)                    */
/* -------------------------------------------------------------------------- */

export default useNovaApi;
// EOF
