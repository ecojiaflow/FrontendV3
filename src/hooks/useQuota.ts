// 📁 src/hooks/useQuota.ts

import { useState, useEffect, useCallback } from 'react';
import { getUserQuota, QuotaResponse } from '../api/realApi';

interface UseQuotaReturn {
  quotaData: QuotaResponse | null;
  isLoading: boolean;
  error: string | null;
  refreshQuota: () => Promise<void>;
}

export const useQuota = (): UseQuotaReturn => {
  const [quotaData, setQuotaData] = useState<QuotaResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier cache localStorage (expire après 5 minutes)
      const cached = localStorage.getItem('ecolojia_quota_cache');
      const cacheTime = localStorage.getItem('ecolojia_quota_cache_time');

      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        if (cacheAge < 5 * 60 * 1000) {
          setQuotaData(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
      }

      // Sinon fetch via API
      const quota = await getUserQuota();
      setQuotaData(quota);
      localStorage.setItem('ecolojia_quota_cache', JSON.stringify(quota));
      localStorage.setItem('ecolojia_quota_cache_time', Date.now().toString());
    } catch (err: any) {
      setError(err.message);
      console.error('Erreur fetch quota:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshQuota = useCallback(async () => {
    localStorage.removeItem('ecolojia_quota_cache');
    localStorage.removeItem('ecolojia_quota_cache_time');
    await fetchQuota();
  }, [fetchQuota]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  return {
    quotaData,
    isLoading,
    error,
    refreshQuota
  };
};
