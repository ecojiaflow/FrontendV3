// PATH: frontend/src/hooks/useNovaApi.ts
import { useState, useCallback } from 'react';
import { NovaAdaptedResult } from '../services/novaAdapter';

interface UseNovaApiState {
  data: NovaAdaptedResult | null;
  loading: boolean;
  error: string | null;
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
  });

  const [lastRequest, setLastRequest] = useState<{
    productName: string;
    ingredients?: string;
  } | null>(null);

  const analyzeProduct = useCallback(async (
    productName: string, 
    ingredients?: string
  ): Promise<NovaAdaptedResult | null> => {
    setState({ data: null, loading: true, error: null });
    
    try {
      console.log('🔬 Simulation analyse NOVA pour:', productName);
      
      // Simulation d'analyse avec données mockées
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: NovaAdaptedResult = {
        success: true,
        data: {
          product: {
            name: productName,
            category: 'Alimentaire',
            novaGroup: ingredients?.includes('E150d') || ingredients?.includes('E952') ? 4 : 
                      ingredients?.includes('huile de palme') ? 4 :
                      ingredients?.includes('bio') ? 1 : 3,
            score: ingredients?.includes('bio') ? 85 : 
                   ingredients?.includes('E150d') ? 25 : 60,
            ultraProcessedMarkers: ingredients?.includes('E150d') ? [
              'Colorant artificiel E150d détecté',
              'Édulcorant E952 détecté',
              'Conservateur E211 détecté'
            ] : [],
            additives: ingredients?.includes('E150d') ? [
              { code: 'E150d', name: 'Caramel IV', category: 'Colorant', riskLevel: 'high' },
              { code: 'E952', name: 'Cyclamate', category: 'Édulcorant', riskLevel: 'medium' },
              { code: 'E211', name: 'Benzoate de sodium', category: 'Conservateur', riskLevel: 'medium' }
            ] : [],
            recommendation: {
              type: ingredients?.includes('bio') ? 'enjoy' : 
                    ingredients?.includes('E150d') ? 'replace' : 'moderate',
              message: ingredients?.includes('bio') ? 
                'Ce produit présente un profil nutritionnel acceptable.' :
                ingredients?.includes('E150d') ?
                'Ce produit contient de nombreux additifs. Nous recommandons de le remplacer.' :
                'Ce produit peut être consommé occasionnellement.',
              alternatives: ingredients?.includes('E150d') ? [
                'Boissons naturelles sans additifs',
                'Eau pétillante avec citron',
                'Jus de fruits bio'
              ] : undefined
            },
            scientificSources: [
              'Classification NOVA - INSERM 2024',
              'Base de données EFSA',
              'Programme National Nutrition Santé'
            ]
          },
          analysis: {
            timestamp: new Date().toISOString(),
            processingTime: 2000,
            confidence: 0.92
          }
        }
      };
      
      setLastRequest({ productName, ingredients });
      setState({ data: mockResult, loading: false, error: null });
      
      return mockResult;
    } catch (error: any) {
      console.error('❌ Erreur analyse NOVA:', error);
      
      const errorMessage = 'Erreur lors de l\'analyse du produit (mode simulation)';
      setState({ data: null, loading: false, error: errorMessage });
      
      return null;
    }
  }, []);

  const retry = useCallback(() => {
    if (lastRequest) {
      return analyzeProduct(lastRequest.productName, lastRequest.ingredients);
    }
    return Promise.resolve(null);
  }, [analyzeProduct, lastRequest]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    setLastRequest(null);
  }, []);

  return {
    ...state,
    analyzeProduct,
    retry,
    reset,
  };
}

// Hook spécialisé pour les tests rapides
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