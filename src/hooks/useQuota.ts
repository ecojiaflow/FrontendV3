// 📁 src/hooks/useQuota.ts - Version mise à jour

import { useState, useEffect, useCallback } from 'react';
import { fetchUserQuota, refreshQuotaAfterAnalysis, DetailedQuotaData, DetailedQuotaResponse } from '../api/realApi';

interface UseQuotaReturn {
  quotaData: DetailedQuotaData | null;
  isLoading: boolean;
  error: string | null;
  refreshQuota: () => Promise<void>;
  canAnalyze: boolean;
  timeUntilReset: string;
}

export const useQuota = (): UseQuotaReturn => {
  const [quotaData, setQuotaData] = useState<DetailedQuotaData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calcul du temps jusqu'au reset
  const getTimeUntilReset = useCallback((resetTime: string): string => {
    try {
      const reset = new Date(resetTime);
      const now = new Date();
      const diff = reset.getTime() - now.getTime();
      
      if (diff <= 0) return 'Maintenant';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    } catch {
      return 'Inconnu';
    }
  }, []);

  // Chargement du quota
  const loadQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Chargement quota...');
      const response: DetailedQuotaResponse = await fetchUserQuota();
      
      if (response.success) {
        setQuotaData(response.quota);
        console.log('✅ Quota chargé:', response.quota);
      } else {
        // Même en cas d'échec, on peut utiliser les données de fallback
        setQuotaData(response.quota);
        setError(response.error || 'Erreur quota');
        console.warn('⚠️ Quota en mode fallback:', response);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement quota:', err);
      setError(err.message || 'Erreur de connexion');
      
      // Quota de secours en cas d'erreur totale
      setQuotaData({
        used_analyses: 0,
        remaining_analyses: 10,
        daily_limit: 10,
        reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        current_date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rafraîchissement du quota (après analyse)
  const refreshQuota = useCallback(async () => {
    try {
      console.log('🔄 Rafraîchissement quota...');
      const response = await refreshQuotaAfterAnalysis();
      
      if (response.success) {
        setQuotaData(response.quota);
        setError(null);
        console.log('✅ Quota rafraîchi:', response.quota);
      } else {
        setError(response.error || 'Erreur rafraîchissement');
      }
    } catch (err: any) {
      console.error('❌ Erreur rafraîchissement quota:', err);
      setError(err.message || 'Erreur rafraîchissement');
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadQuota();
  }, [loadQuota]);

  // Rafraîchissement périodique (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadQuota();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadQuota, isLoading]);

  // Calculs dérivés
  const canAnalyze = Boolean(quotaData && quotaData.remaining_analyses > 0);
  const timeUntilReset = quotaData ? getTimeUntilReset(quotaData.reset_time) : '';

  return {
    quotaData,
    isLoading,
    error,
    refreshQuota,
    canAnalyze,
    timeUntilReset
  };
};