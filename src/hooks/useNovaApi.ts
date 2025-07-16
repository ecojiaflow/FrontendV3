// PATH: frontend/src/hooks/useNovaApi.ts
import { useState, useCallback } from 'react';
import { analyzeAuto, AnalyzeRequest } from '../api/realApi';
import { NovaAdapter, NovaAdaptedResult } from '../services/novaAdapter';

interface UseNovaApiState {
  data: NovaAdaptedResult | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
}

interface UseNovaApiReturn extends UseNovaApiState {
  analyzeProduct: (productName: string, ingredients?: string) => Promise<NovaAdaptedResult | null>;
  retry: () => Promise<NovaAdaptedResult | null>;
  reset: () => void;
}

export function useNovaApi(): UseNovaApiReturn {
  const [state, setState] = useState<UseNovaApiState>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
  });

  const [lastRequest, setLastRequest] = useState<{
    productName: string;
    ingredients?: string;
  } | null>(null);

  const executeAnalysis = useCallback(async (
    productName: string, 
    ingredients?: string,
    isRetry: boolean = false
  ): Promise<NovaAdaptedResult | null> => {
    const startTime = Date.now();
    
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      retryCount: isRetry ? prev.retryCount + 1 : 0
    }));
    
    try {
      console.log('🔬 Démarrage analyse NOVA pour:', productName);
      console.log('📡 API URL:', 'https://ecolojia-backend-working.onrender.com');
      
      const request: AnalyzeRequest = {
        product_name: productName,
        ingredients: ingredients || productName,
        description: `Analyse des ingrédients: ${ingredients || productName}`
      };

      console.log('📡 Envoi requête à l\'API:', request);
      
      // Sauvegarder la requête pour retry
      setLastRequest({ productName, ingredients });
      
      const apiResponse = await analyzeAuto(request);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Réponse API reçue:', apiResponse);
      
      const novaResult = NovaAdapter.adaptAnalysisToNova(
        apiResponse, 
        productName, 
        processingTime
      );
      
      console.log('🎯 Résultat NOVA adapté:', novaResult);
      
      setState(prev => ({ 
        ...prev,
        data: novaResult, 
        loading: false, 
        error: null,
        retryCount: 0
      }));
      
      return novaResult;
    } catch (error: any) {
      console.error('❌ Erreur analyse NOVA:', error);
      
      let errorMessage = 'Erreur lors de l\'analyse du produit';
      
      // Gestion spécifique des erreurs
      if (error.message === 'QUOTA_EXCEEDED') {
        errorMessage = 'Quota d\'analyses dépassé. Réessayez demain.';
      } else if (error.message === 'LOW_CONFIDENCE') {
        errorMessage = 'Produit non reconnu. Vérifiez les ingrédients saisis.';
      } else if (error.message === 'UNAUTHORIZED') {
        errorMessage = 'Session expirée. Rechargez la page.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Problème de connexion réseau. Vérifiez votre connexion internet.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else if (error.response?.status === 503) {
        errorMessage = 'Service temporairement indisponible. Réessayez dans quelques minutes.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Trop de requêtes. Attendez quelques minutes.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur. Réessayez dans quelques minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({ 
        ...prev,
        data: null, 
        loading: false, 
        error: errorMessage,
        retryCount: prev.retryCount + (isRetry ? 1 : 0)
      }));
      
      return null;
    }
  }, [state.retryCount]);

  const analyzeProduct = useCallback((productName: string, ingredients?: string) => {
    return executeAnalysis(productName, ingredients, false);
  }, [executeAnalysis]);

  const retry = useCallback(() => {
    if (lastRequest) {
      return executeAnalysis(lastRequest.productName, lastRequest.ingredients, true);
    }
    return Promise.resolve(null);
  }, [executeAnalysis, lastRequest]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, retryCount: 0 });
    setLastRequest(null);
  }, []);

  return {
    ...state,
    analyzeProduct,
    retry,
    reset,
  };
}

// Hook spécialisé pour les tests rapides avec gestion d'erreurs
export function useQuickNovaTest() {
  const { analyzeProduct, retry, ...rest } = useNovaApi();

  const testCocaCola = useCallback(() => {
    return analyzeProduct(
      'Coca-Cola Original',
      'Eau gazéifiée, sucre, sirop de glucose-fructose, arôme naturel de cola, colorant E150d (caramel IV), acidifiant E338 (acide phosphorique), édulcorant E952 (cyclamate de sodium), conservateur E211 (benzoate de sodium)'
    );
  }, [analyzeProduct]);

  const testNutella = useCallback(() => {
    return analyzeProduct(
      'Nutella Pâte à tartiner',
      'Sucre, huile de palme, NOISETTES 13%, cacao maigre 7.4%, LAIT écrémé en poudre 6.6%, LACTOSÉRUM en poudre, émulsifiants E322 (lécithines) E471 (mono- et diglycérides d\'acides gras), arôme vanilline'
    );
  }, [analyzeProduct]);

  const testPizzaSurgelee = useCallback(() => {
    return analyzeProduct(
      'Pizza 4 Fromages Surgelée',
      'Pâte (farine de BLÉ, eau, huile de tournesol, levure, sel, sucre), fromages 25% (MOZZARELLA, EMMENTAL, GORGONZOLA, PARMESAN), sauce tomate, conservateur E202, exhausteur de goût E621, stabilisant E412, colorant E150d'
    );
  }, [analyzeProduct]);

  return {
    ...rest,
    analyzeProduct,
    retry,
    testCocaCola,
    testNutella,
    testPizzaSurgelee
  };
}
// EOF