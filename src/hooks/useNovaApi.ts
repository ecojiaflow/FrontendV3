// PATH: frontend/src/hooks/useNovaApi.ts
import { useState, useCallback } from 'react';
import { NovaAdaptedResult } from '../services/novaAdapter';

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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const analyze = useCallback(async (payload: AnalysisRequest) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🔬 Démarrage analyse pour:', payload.title);

      // ✅ URL API corrigée avec le bon endpoint
      const API_URL = 'https://ecolojia-backend-working.onrender.com/api/analyze/auto';

      console.log('📡 URL API utilisée:', API_URL);
      console.log('📦 Payload envoyé:', payload);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_name: payload.title,
          ingredients: Array.isArray(payload.ingredients) 
            ? payload.ingredients.join(', ') 
            : payload.ingredients || payload.description || '',
          description: payload.description || `Analyse ${payload.detected_type || 'produit'}: ${payload.title}`,
          detected_type: payload.detected_type || 'food'
        }),
      });

      console.log('📨 Status réponse:', res.status, res.statusText);

      if (!res.ok) {
        let errorMessage = `Erreur ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Impossible de parser l\'erreur JSON');
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('✅ Réponse API reçue:', data);
      
      setResult(data);
    } catch (e: any) {
      console.error('❌ useNovaApi - analyze error:', e);
      setError(e.message || 'Erreur inconnue lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, analyze };
}

/* -------------------------------------------------------------------------- */
/* ✅ HOOK POUR COMPATIBILITÉ AVEC L'ANCIENNE VERSION                          */
/* -------------------------------------------------------------------------- */

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

export function useNovaApiLegacy(): UseNovaApiReturn {
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
      
      // Simulation d'analyse avec données mockées réalistes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isCosmetic = productName.toLowerCase().includes('shampoing') || 
                        productName.toLowerCase().includes('crème') ||
                        productName.toLowerCase().includes('rouge') ||
                        productName.toLowerCase().includes('cosmétique');
      
      const isDetergent = productName.toLowerCase().includes('lessive') || 
                         productName.toLowerCase().includes('vaisselle') ||
                         productName.toLowerCase().includes('détergent');
      
      const mockResult: NovaAdaptedResult = {
        success: true,
        data: {
          product: {
            name: productName,
            category: isCosmetic ? 'Cosmétique' : isDetergent ? 'Détergent' : 'Alimentaire',
            novaGroup: ingredients?.includes('E150d') || ingredients?.includes('E952') ? 4 : 
                      ingredients?.includes('huile de palme') || ingredients?.includes('parfum') ? 4 :
                      ingredients?.includes('bio') || ingredients?.includes('naturel') ? 1 : 3,
            score: ingredients?.includes('bio') || ingredients?.includes('naturel') ? 85 : 
                   ingredients?.includes('E150d') || ingredients?.includes('parfum') ? 25 : 60,
            ultraProcessedMarkers: ingredients?.includes('E150d') || ingredients?.includes('parfum') ? [
              isCosmetic ? 'Parfum synthétique détecté' : 'Colorant artificiel E150d détecté',
              isCosmetic ? 'Conservateurs chimiques' : 'Édulcorant E952 détecté',
              isCosmetic ? 'Tensioactifs sulfatés' : 'Conservateur E211 détecté'
            ] : [],
            additives: ingredients?.includes('E150d') || ingredients?.includes('parfum') ? [
              { 
                code: isCosmetic ? 'SLS' : 'E150d', 
                name: isCosmetic ? 'Sodium Lauryl Sulfate' : 'Caramel IV', 
                category: isCosmetic ? 'Tensioactif' : 'Colorant', 
                riskLevel: 'high' as const
              },
              { 
                code: isCosmetic ? 'Parfum' : 'E952', 
                name: isCosmetic ? 'Parfum synthétique' : 'Cyclamate', 
                category: isCosmetic ? 'Fragrance' : 'Édulcorant', 
                riskLevel: 'medium' as const
              }
            ] : [],
            recommendation: {
              type: ingredients?.includes('bio') || ingredients?.includes('naturel') ? 'enjoy' : 
                    ingredients?.includes('E150d') || ingredients?.includes('parfum') ? 'replace' : 'moderate',
              message: ingredients?.includes('bio') || ingredients?.includes('naturel') ? 
                `Ce ${isCosmetic ? 'produit cosmétique' : isDetergent ? 'produit ménager' : 'produit'} présente un profil acceptable.` :
                ingredients?.includes('E150d') || ingredients?.includes('parfum') ?
                `Ce ${isCosmetic ? 'produit cosmétique' : isDetergent ? 'produit ménager' : 'produit'} contient des substances préoccupantes. Nous recommandons de le remplacer.` :
                `Ce ${isCosmetic ? 'produit cosmétique' : isDetergent ? 'produit ménager' : 'produit'} peut être utilisé occasionnellement.`,
              alternatives: ingredients?.includes('E150d') || ingredients?.includes('parfum') ? 
                isCosmetic ? [
                  'Cosmétiques bio certifiés',
                  'Produits sans parfum',
                  'Alternatives naturelles maison'
                ] : isDetergent ? [
                  'Détergents écologiques',
                  'Produits sans phosphates',
                  'Alternatives DIY naturelles'
                ] : [
                  'Produits biologiques équivalents',
                  'Préparations maison',
                  'Alternatives sans additifs'
                ] : undefined
            },
            scientificSources: isCosmetic ? [
              'Règlement (CE) n° 1223/2009 relatif aux produits cosmétiques',
              'Base de données CosIng (Commission européenne)',
              'Évaluations SCCS (Comité scientifique pour la sécurité des consommateurs)',
              'ANSM - Agence nationale de sécurité du médicament'
            ] : isDetergent ? [
              'Règlement (CE) n° 648/2004 relatif aux détergents',
              'Classification CLP (Classification, étiquetage et emballage)',
              'Base de données ECHA (Agence européenne des produits chimiques)',
              'ADEME - Agence de l\'environnement et de la maîtrise de l\'énergie'
            ] : [
              'Classification NOVA - INSERM 2024',
              'Base de données EFSA',
              'Programme National Nutrition Santé',
              'ANSES - Agence nationale de sécurité sanitaire'
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

// Hook spécialisé pour les tests rapides avec gestion multi-catégories
export function useQuickNovaTest() {
  const { analyzeProduct, retry, ...rest } = useNovaApiLegacy();

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

  // Tests cosmétiques
  const testShampoingBio = useCallback(() => {
    return analyzeProduct(
      'Shampoing Bio Naturel',
      'Aqua, Coco-Glucoside, Glycérine végétale, Huile essentielle de lavande bio, Extrait d\'aloe vera bio, Conservateur naturel, Parfum naturel'
    );
  }, [analyzeProduct]);

  const testCremeVisage = useCallback(() => {
    return analyzeProduct(
      'Crème Visage Anti-âge',
      'Aqua, Cyclopentasiloxane, Glycérine, Butylene Glycol, Parfum, Sodium Hyaluronate, Retinol, Parabènes, BHT, Colorants artificiels'
    );
  }, [analyzeProduct]);

  // Tests détergents
  const testLessiveBio = useCallback(() => {
    return analyzeProduct(
      'Lessive Écologique Bio',
      'Savon de Marseille, Bicarbonate de sodium, Cristaux de soude, Huiles essentielles bio, Enzymes naturelles, Agents lavants végétaux'
    );
  }, [analyzeProduct]);

  const testLiquideVaisselle = useCallback(() => {
    return analyzeProduct(
      'Liquide Vaisselle Industriel',
      'Sodium Lauryl Sulfate, Parfum, Colorants, Conservateurs, Phosphates, Agents moussants chimiques, EDTA'
    );
  }, [analyzeProduct]);

  return {
    ...rest,
    analyzeProduct,
    retry,
    // Tests alimentaires
    testCocaCola,
    testNutella,
    testPizzaSurgelee,
    // Tests cosmétiques
    testShampoingBio,
    testCremeVisage,
    // Tests détergents
    testLessiveBio,
    testLiquideVaisselle
  };
}

export default useNovaApi;
// EOF