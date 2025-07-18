// PATH: frontend/ecolojiaFrontV3/src/services/ai/novaClassifier.ts
export interface NovaResult {
  productName: string;
  novaGroup: number;
  confidence: number;
  reasoning: string;
  additives: {
    detected: Array<{
      code: string;
      name: string;
      riskLevel: 'low' | 'medium' | 'high';
      description: string;
    }>;
    total: number;
  };
  recommendations: string[];
  healthScore: number;
  isProcessed: boolean;
  category: string;
  timestamp: string;
  analysis?: {
    totalCount: number;
    ultraProcessingMarkers: any[];
    industrialIngredients: string[];
    additives: string[];
    naturalIngredients: string[];
    suspiciousTerms: string[];
  };
}

// État global simple pour la démo
let currentAnalysis: NovaResult | null = null;
let isAnalyzing = false;

/**
 * Analyse un produit via l'API backend ECOLOJIA
 * @param productName Nom du produit
 * @param ingredients Liste des ingrédients
 * @returns Résultat de l'analyse NOVA
 */
export const analyzeProduct = async (
  productName: string, 
  ingredients: string
): Promise<NovaResult> => {
  if (isAnalyzing) {
    throw new Error('Une analyse est déjà en cours');
  }

  if (!productName?.trim() || !ingredients?.trim()) {
    throw new Error('Le nom du produit et les ingrédients sont requis');
  }

  try {
    isAnalyzing = true;
    
    // Simulation de delay pour l'UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // URL de l'API backend déployée sur Render
    const API_BASE = 'https://ecolojia-backend-working.onrender.com';
    
    console.log('🚀 Appel API backend:', { productName, ingredients });
    
    const response = await fetch(`${API_BASE}/api/analyze/auto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        productName: productName.trim(),
        ingredients: ingredients.trim(),
        category: 'alimentaire' // Par défaut
      })
    });

    if (!response.ok) {
      // Si l'API backend n'est pas accessible, utiliser des données mock
      console.warn(`API backend indisponible (${response.status}), utilisation des données mock`);
      return generateMockAnalysis(productName, ingredients);
    }

    const result = await response.json();
    
    // Transformation du résultat API vers le format attendu
    const novaResult: NovaResult = {
      productName: result.productName || productName,
      novaGroup: result.novaGroup || estimateNovaGroup(ingredients),
      confidence: result.confidence || 85,
      reasoning: result.reasoning || generateReasoning(ingredients),
      additives: {
        detected: result.additives?.detected || detectAdditives(ingredients),
        total: result.additives?.total || 0
      },
      recommendations: result.recommendations || generateRecommendations(ingredients),
      healthScore: result.healthScore || calculateHealthScore(ingredients),
      isProcessed: result.isProcessed ?? estimateProcessingLevel(ingredients),
      category: result.category || 'alimentaire',
      timestamp: new Date().toISOString(),
      analysis: result.analysis || undefined
    };

    currentAnalysis = novaResult;
    return novaResult;

  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    // Fallback vers analyse mock en cas d'erreur réseau
    return generateMockAnalysis(productName, ingredients);
  } finally {
    isAnalyzing = false;
  }
};

/**
 * Génère une analyse mock basée sur les ingrédients
 */
function generateMockAnalysis(productName: string, ingredients: string): NovaResult {
  const novaGroup = estimateNovaGroup(ingredients);
  const additives = detectAdditives(ingredients);
  
  return {
    productName,
    novaGroup,
    confidence: 78,
    reasoning: generateReasoning(ingredients),
    additives: {
      detected: additives,
      total: additives.length
    },
    recommendations: generateRecommendations(ingredients),
    healthScore: calculateHealthScore(ingredients),
    isProcessed: novaGroup >= 3,
    category: 'alimentaire',
    timestamp: new Date().toISOString()
  };
}

/**
 * Estime le groupe NOVA basé sur les ingrédients
 */
function estimateNovaGroup(ingredients: string): number {
  const lower = ingredients.toLowerCase();
  
  // Groupe 4 - Ultra-transformé
  if (lower.match(/e\d{3}|sirop.*fructose|huile.*palme|exhausteur.*goût|colorant|conservateur|émulsifiant/)) {
    return 4;
  }
  
  // Groupe 3 - Transformé
  if (lower.match(/sucre|sel|huile|farine.*blé|levure/)) {
    return 3;
  }
  
  // Groupe 2 - Ingrédients culinaires
  if (lower.match(/beurre|huile.*olive|vinaigre|miel/)) {
    return 2;
  }
  
  // Groupe 1 - Non transformé
  return 1;
}

/**
 * Détecte les additifs dans les ingrédients
 */
function detectAdditives(ingredients: string): Array<{
  code: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
}> {
  const additives = [];
  const lower = ingredients.toLowerCase();
  
  // Base de données simplifiée d'additifs
  const additivesDB = [
    { code: 'E150d', name: 'Caramel IV', risk: 'medium' as const, desc: 'Colorant caramel ammoniacal' },
    { code: 'E621', name: 'Glutamate monosodique', risk: 'medium' as const, desc: 'Exhausteur de goût' },
    { code: 'E211', name: 'Benzoate de sodium', risk: 'low' as const, desc: 'Conservateur antimicrobien' },
    { code: 'E322', name: 'Lécithines', risk: 'low' as const, desc: 'Émulsifiant naturel' },
    { code: 'E471', name: 'Mono- et diglycérides', risk: 'low' as const, desc: 'Émulsifiant' },
    { code: 'E202', name: 'Sorbate de potassium', risk: 'low' as const, desc: 'Conservateur' },
    { code: 'E412', name: 'Gomme de guar', risk: 'low' as const, desc: 'Stabilisant naturel' },
    { code: 'E338', name: 'Acide phosphorique', risk: 'medium' as const, desc: 'Acidifiant' },
    { code: 'E952', name: 'Cyclamate de sodium', risk: 'medium' as const, desc: 'Édulcorant artificiel' }
  ];
  
  for (const additive of additivesDB) {
    if (lower.includes(additive.code.toLowerCase())) {
      additives.push({
        code: additive.code,
        name: additive.name,
        riskLevel: additive.risk,
        description: additive.desc
      });
    }
  }
  
  return additives;
}

/**
 * Génère le raisonnement de classification
 */
function generateReasoning(ingredients: string): string {
  const novaGroup = estimateNovaGroup(ingredients);
  const additives = detectAdditives(ingredients);
  
  switch (novaGroup) {
    case 4:
      return `Produit ultra-transformé contenant ${additives.length} additif(s) et des ingrédients industriels. Présence d'agents texturants, colorants ou exhausteurs de goût.`;
    case 3:
      return `Produit transformé avec ajout de sucre, sel ou matières grasses. Modification substantielle de l'aliment d'origine.`;
    case 2:
      return `Ingrédient culinaire utilisé en petite quantité pour la préparation, l'assaisonnement et la cuisson.`;
    default:
      return `Aliment non transformé ou minimalement transformé, proche de son état naturel.`;
  }
}

/**
 * Génère des recommandations basées sur l'analyse
 */
function generateRecommendations(ingredients: string): string[] {
  const novaGroup = estimateNovaGroup(ingredients);
  const additives = detectAdditives(ingredients);
  
  const recommendations = [];
  
  if (novaGroup >= 4) {
    recommendations.push('🔄 Privilégiez des alternatives moins transformées');
    recommendations.push('⚠️ Consommation occasionnelle recommandée');
    
    if (additives.length > 3) {
      recommendations.push('🧪 Nombreux additifs détectés - vérifiez la tolérance');
    }
  } else if (novaGroup === 3) {
    recommendations.push('👌 Produit acceptable en consommation modérée');
    recommendations.push('🏠 Privilégiez la version maison quand possible');
  } else if (novaGroup === 2) {
    recommendations.push('✅ Bon ingrédient culinaire');
    recommendations.push('⚖️ Utilisez avec modération pour l\'équilibre');
  } else {
    recommendations.push('🌟 Excellent choix nutritionnel !');
    recommendations.push('🥗 Parfait pour une alimentation saine');
  }

  // Recommandations générales
  recommendations.push('📚 Consultez l\'étiquetage complet');
  recommendations.push('🩺 Adaptez selon vos besoins nutritionnels');
  
  return recommendations;
}

/**
 * Calcule un score de santé basé sur la classification NOVA
 */
function calculateHealthScore(ingredients: string): number {
  const novaGroup = estimateNovaGroup(ingredients);
  const additives = detectAdditives(ingredients);
  
  let score = 100;
  
  // Pénalités par groupe NOVA
  switch (novaGroup) {
    case 4: score -= 60; break;
    case 3: score -= 30; break;
    case 2: score -= 10; break;
    default: score -= 0;
  }
  
  // Pénalités additionnelles pour les additifs
  score -= additives.length * 5;
  
  // Bonus pour ingrédients naturels
  if (ingredients.toLowerCase().includes('bio') || ingredients.toLowerCase().includes('naturel')) {
    score += 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Estime le niveau de transformation
 */
function estimateProcessingLevel(ingredients: string): boolean {
  return estimateNovaGroup(ingredients) >= 3;
}

/**
 * Réinitialise l'état de l'analyseur
 */
export const reset = (): void => {
  currentAnalysis = null;
  isAnalyzing = false;
  console.log('🔄 NovaClassifier réinitialisé');
};

/**
 * Récupère l'analyse actuelle
 */
export const getCurrentAnalysis = (): NovaResult | null => {
  return currentAnalysis;
};

/**
 * Vérifie si une analyse est en cours
 */
export const getIsAnalyzing = (): boolean => {
  return isAnalyzing;
};

// Export par défaut pour compatibilité
export default {
  analyzeProduct,
  reset,
  getCurrentAnalysis,
  getIsAnalyzing
};
// EOF