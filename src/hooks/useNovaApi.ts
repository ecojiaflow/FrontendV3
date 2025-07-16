// PATH: frontend/src/hooks/useNovaApi.ts
import { useState, useCallback } from 'react';
import { analyzeAuto, AnalyzeRequest } from '../api/realApi';
import { NovaAdapter, NovaAdaptedResult } from '../services/novaAdapter';

interface UseNovaApiState {
  data: NovaAdaptedResult | null;
  loading: boolean;
  error: string | null;
}

interface UseNovaApiReturn extends UseNovaApiState {
  analyzeProduct: (productName: string, ingredients?: string) => Promise<NovaAdaptedResult | null>;
  reset: () => void;
}

export function useNovaApi(): UseNovaApiReturn {
  const [state, setState] = useState<UseNovaApiState>({
    data: null,
    loading: false,
    error: null,
  });

  const analyzeProduct = useCallback(async (
    productName: string, 
    ingredients?: string
  ): Promise<NovaAdaptedResult | null> => {
    const startTime = Date.now();
    setState({ data: null, loading: true, error: null });
    
    try {
      console.log('🔬 Démarrage analyse NOVA pour:', productName);
      
      const request: AnalyzeRequest = {
        product_name: productName,
        ingredients: ingredients || productName,
        description: `Analyse des ingrédients: ${ingredients || productName}`
      };

      console.log('📡 Envoi requête à l\'API:', request);
      
      const apiResponse = await analyzeAuto(request);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Réponse API reçue:', apiResponse);
      
      const novaResult = NovaAdapter.adaptAnalysisToNova(
        apiResponse, 
        productName, 
        processingTime
      );
      
      console.log('🎯 Résultat NOVA adapté:', novaResult);
      
      setState({ 
        data: novaResult, 
        loading: false, 
        error: null 
      });
      
      return novaResult;
    } catch (error: any) {
      console.error('❌ Erreur analyse NOVA:', error);
      
      let errorMessage = 'Erreur lors de l\'analyse du produit';
      
      if (error.message === 'QUOTA_EXCEEDED') {
        errorMessage = 'Quota d\'analyses dépassé. Réessayez demain.';
      } else if (error.message === 'LOW_CONFIDENCE') {
        errorMessage = 'Produit non reconnu. Vérifiez les ingrédients saisis.';
      } else if (error.message === 'UNAUTHORIZED') {
        errorMessage = 'Session expirée. Rechargez la page.';
      } else if (error.response?.status === 503) {
        errorMessage = 'Service temporairement indisponible. Réessayez dans quelques minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState({ 
        data: null, 
        loading: false, 
        error: errorMessage 
      });
      
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    analyzeProduct,
    reset,
  };
}

// Hook spécialisé pour les tests rapides
export function useQuickNovaTest() {
  const { analyzeProduct, ...rest } = useNovaApi();

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
    testCocaCola,
    testNutella,
    testPizzaSurgelee
  };
}
// EOF