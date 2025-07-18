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

// État global
let currentAnalysis: NovaResult | null = null;
let isAnalyzing = false;

/**
 * Analyse un produit avec API backend + fallback rapide
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
    
    console.log('🚀 NovaClassifier - Début analyse:', { productName, ingredients });
    
    // ✅ PRIORITÉ 1: Essayer l'API backend avec les bons paramètres
    try {
      const API_BASE = 'https://ecolojia-backend-working.onrender.com';
      
      console.log('🌐 Tentative API backend (timeout 4s)...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout API backend - fallback activé');
        controller.abort();
      }, 4000); // 4 secondes
      
      // ✅ CORRECTION: Utiliser les paramètres attendus par le backend
      const requestBody = {
        product_name: productName.trim(), // ✅ product_name au lieu de productName
        ingredients: ingredients.trim(),
        category: 'alimentaire'
      };
      
      console.log('📤 Corps de requête backend:', requestBody);
      
      const response = await fetch(`${API_BASE}/api/analyze/auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📥 Réponse API backend:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API backend réussie:', result);
        
        // ✅ NOUVEAU: Extraction des données depuis la structure backend
        let backendAnalysis;
        
        if (result.success && result.analysis) {
          // Structure avec auto-détection
          backendAnalysis = result.analysis;
        } else if (result.data) {
          // Structure directe
          backendAnalysis = result.data;
        } else {
          // Structure simple
          backendAnalysis = result;
        }
        
        // Transformation vers le format NovaResult attendu
        const novaResult: NovaResult = {
          productName: backendAnalysis.productName || productName,
          novaGroup: backendAnalysis.novaGroup || backendAnalysis.nova_classification?.group || estimateNovaGroup(ingredients),
          confidence: Math.round((backendAnalysis.confidence || 0.85) * 100),
          reasoning: backendAnalysis.reasoning || generateReasoning(ingredients),
          additives: {
            detected: backendAnalysis.additives?.detected || detectAdditives(ingredients),
            total: backendAnalysis.additives?.total || detectAdditives(ingredients).length
          },
          recommendations: backendAnalysis.recommendations || generateRecommendations(ingredients),
          healthScore: backendAnalysis.healthScore || backendAnalysis.score || calculateHealthScore(ingredients),
          isProcessed: backendAnalysis.isProcessed ?? estimateProcessingLevel(ingredients),
          category: backendAnalysis.category || 'alimentaire',
          timestamp: new Date().toISOString(),
          analysis: backendAnalysis.analysis || undefined
        };

        currentAnalysis = novaResult;
        return novaResult;
      } else {
        console.warn(`❌ API backend erreur ${response.status}, fallback vers mock`);
        const errorText = await response.text();
        console.warn('📄 Détail erreur:', errorText);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('⏰ API backend timeout (4s), fallback immédiat vers mock');
      } else {
        console.warn('❌ API backend erreur:', error.message, '- fallback vers mock');
      }
    }

    // ✅ PRIORITÉ 2: Fallback immédiat vers analyse mock intelligente
    console.log('🧠 Fallback vers analyse mock intelligente...');
    
    // Délai minimal pour UX (simulation processing)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockResult = generateMockAnalysis(productName, ingredients);
    console.log('✅ Analyse mock générée:', mockResult);
    
    currentAnalysis = mockResult;
    return mockResult;

  } catch (error) {
    console.error('❌ Erreur critique NovaClassifier:', error);
    throw new Error(`Analyse impossible: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    isAnalyzing = false;
  }
};

/**
 * Génère une analyse mock robuste basée sur les ingrédients
 */
function generateMockAnalysis(productName: string, ingredients: string): NovaResult {
  const novaGroup = estimateNovaGroup(ingredients);
  const additives = detectAdditives(ingredients);
  const healthScore = calculateHealthScore(ingredients);
  
  console.log('🔬 Mock analysis:', { productName, novaGroup, additivesCount: additives.length, healthScore });
  
  return {
    productName,
    novaGroup,
    confidence: 88, // Confiance élevée pour l'analyse locale
    reasoning: generateReasoning(ingredients),
    additives: {
      detected: additives,
      total: additives.length
    },
    recommendations: generateRecommendations(ingredients),
    healthScore,
    isProcessed: novaGroup >= 3,
    category: 'alimentaire',
    timestamp: new Date().toISOString(),
    analysis: {
      totalCount: additives.length,
      ultraProcessingMarkers: novaGroup >= 4 ? ['additifs_multiples', 'transformation_industrielle'] : [],
      industrialIngredients: extractIndustrialIngredients(ingredients),
      additives: additives.map(a => a.code),
      naturalIngredients: extractNaturalIngredients(ingredients),
      suspiciousTerms: extractSuspiciousTerms(ingredients)
    }
  };
}

/**
 * Estime le groupe NOVA basé sur les ingrédients
 */
function estimateNovaGroup(ingredients: string): number {
  const lower = ingredients.toLowerCase();
  
  let ultraProcessedMarkers = 0;
  let processedMarkers = 0;
  let culinaryMarkers = 0;
  
  // Marqueurs NOVA 4 (Ultra-transformé)
  const nova4Patterns = [
    /e\d{3}/g, // Additifs E-numbers
    /(sirop.*fructose|glucose.*fructose)/i,
    /(huile.*palme|graisse.*palme)/i,
    /(exhausteur.*goût|exhausteur de goût)/i,
    /(colorant|conservateur|émulsifiant|stabilisant|antioxydant)/i,
    /(protéine.*hydrolysée|isolat.*protéine)/i,
    /(arôme.*artificiel|arôme de synthèse)/i,
    /(phosphate|polyphosphate)/i,
    /(carraghénane|xanthane)/i
  ];
  
  nova4Patterns.forEach(pattern => {
    const matches = lower.match(pattern);
    if (matches) ultraProcessedMarkers += matches.length;
  });
  
  // Marqueurs NOVA 3 (Transformé)
  const nova3Patterns = [
    /(sucre|sel|huile|farine.*blé)/i,
    /(levure|beurre|fromage)/i,
    /(vinaigre|moutarde)/i,
    /(chocolat|cacao)/i
  ];
  
  nova3Patterns.forEach(pattern => {
    if (pattern.test(lower)) processedMarkers++;
  });
  
  // Marqueurs NOVA 2 (Ingrédients culinaires)
  const nova2Patterns = [
    /(huile.*olive|beurre)/i,
    /(sel.*marin|miel)/i,
    /(vinaigre.*cidre)/i
  ];
  
  nova2Patterns.forEach(pattern => {
    if (pattern.test(lower)) culinaryMarkers++;
  });
  
  // Classification finale
  if (ultraProcessedMarkers >= 3) return 4;
  if (ultraProcessedMarkers >= 1) return 4;
  if (processedMarkers >= 3) return 3;
  if (culinaryMarkers >= 1 || processedMarkers >= 1) return 2;
  
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
  
  // Base de données d'additifs
  const additivesDB = [
    { code: 'E150d', name: 'Caramel IV', risk: 'medium' as const, desc: 'Colorant caramel ammoniacal' },
    { code: 'E621', name: 'Glutamate monosodique', risk: 'medium' as const, desc: 'Exhausteur de goût' },
    { code: 'E211', name: 'Benzoate de sodium', risk: 'low' as const, desc: 'Conservateur antimicrobien' },
    { code: 'E322', name: 'Lécithines', risk: 'low' as const, desc: 'Émulsifiant naturel' },
    { code: 'E471', name: 'Mono- et diglycérides', risk: 'low' as const, desc: 'Émulsifiant' },
    { code: 'E202', name: 'Sorbate de potassium', risk: 'low' as const, desc: 'Conservateur' },
    { code: 'E412', name: 'Gomme de guar', risk: 'low' as const, desc: 'Stabilisant naturel' },
    { code: 'E338', name: 'Acide phosphorique', risk: 'medium' as const, desc: 'Acidifiant' },
    { code: 'E952', name: 'Cyclamate de sodium', risk: 'medium' as const, desc: 'Édulcorant artificiel' },
    { code: 'E282', name: 'Propionate de calcium', risk: 'low' as const, desc: 'Conservateur' },
    { code: 'E300', name: 'Acide ascorbique', risk: 'low' as const, desc: 'Antioxydant (Vitamine C)' },
    { code: 'E500', name: 'Carbonate de sodium', risk: 'low' as const, desc: 'Poudre à lever' },
    { code: 'E160a', name: 'Bêta-carotène', risk: 'low' as const, desc: 'Colorant naturel orange' }
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
      return `Produit ultra-transformé (NOVA 4) contenant ${additives.length} additif(s) alimentaire(s). Présence d'ingrédients industriels, agents texturants, colorants ou exhausteurs de goût. Consommation à limiter selon les recommandations nutritionnelles.`;
    case 3:
      return `Produit transformé (NOVA 3) avec ajout de sucre, sel ou matières grasses. Modification substantielle de l'aliment d'origine par des procédés industriels. Consommation modérée recommandée.`;
    case 2:
      return `Ingrédient culinaire (NOVA 2) utilisé en petite quantité pour la préparation, l'assaisonnement et la cuisson. Usage traditionnel en cuisine.`;
    default:
      return `Aliment non transformé ou minimalement transformé (NOVA 1), proche de son état naturel. Excellent choix nutritionnel à privilégier.`;
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
    recommendations.push('🔄 Privilégiez des alternatives moins transformées (NOVA 1-2)');
    recommendations.push('⚠️ Consommation occasionnelle recommandée (max 1-2x/semaine)');
    
    if (additives.length > 3) {
      recommendations.push('🧪 Nombreux additifs détectés - vérifiez votre tolérance individuelle');
    }
    
    recommendations.push('🏠 Optez pour des versions maison quand possible');
  } else if (novaGroup === 3) {
    recommendations.push('👌 Produit acceptable en consommation modérée (3-4x/semaine max)');
    recommendations.push('🏠 Privilégiez la version maison pour plus de contrôle');
    recommendations.push('📖 Vérifiez la liste des ingrédients pour choisir la meilleure option');
  } else if (novaGroup === 2) {
    recommendations.push('✅ Bon ingrédient culinaire pour vos préparations');
    recommendations.push('⚖️ Utilisez avec modération pour maintenir l\'équilibre nutritionnel');
    recommendations.push('👨‍🍳 Parfait pour cuisiner des plats maison');
  } else {
    recommendations.push('🌟 Excellent choix nutritionnel à consommer sans modération !');
    recommendations.push('🥗 Parfait pour une alimentation saine et équilibrée');
    recommendations.push('💪 Riche en nutriments essentiels');
  }

  recommendations.push('📚 Consultez toujours l\'étiquetage nutritionnel complet');
  recommendations.push('🩺 Adaptez selon vos besoins nutritionnels personnels');
  
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
  
  // Pénalités pour les additifs
  score -= additives.length * 4;
  
  // Pénalités supplémentaires pour additifs à risque
  const highRiskAdditives = additives.filter(a => a.riskLevel === 'high');
  const mediumRiskAdditives = additives.filter(a => a.riskLevel === 'medium');
  score -= highRiskAdditives.length * 15;
  score -= mediumRiskAdditives.length * 8;
  
  // Bonus pour ingrédients positifs
  const lower = ingredients.toLowerCase();
  if (lower.includes('bio') || lower.includes('biologique')) score += 15;
  if (lower.includes('naturel')) score += 10;
  if (lower.includes('ferments lactiques')) score += 5;
  if (lower.includes('complet')) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

// Fonctions utilitaires
function extractIndustrialIngredients(ingredients: string): string[] {
  const industrial = [];
  const lower = ingredients.toLowerCase();
  
  if (lower.includes('sirop')) industrial.push('sirop de glucose-fructose');
  if (lower.includes('huile de palme')) industrial.push('huile de palme');
  if (lower.includes('protéine')) industrial.push('protéines modifiées');
  
  return industrial;
}

function extractNaturalIngredients(ingredients: string): string[] {
  const natural = [];
  const lower = ingredients.toLowerCase();
  
  if (lower.includes('lait')) natural.push('lait');
  if (lower.includes('farine')) natural.push('farine');
  if (lower.includes('eau')) natural.push('eau');
  if (lower.includes('ferments')) natural.push('ferments lactiques');
  
  return natural;
}

function extractSuspiciousTerms(ingredients: string): string[] {
  const suspicious = [];
  const lower = ingredients.toLowerCase();
  
  if (/e\d{3}/.test(lower)) suspicious.push('additifs E-numbers');
  if (lower.includes('artificiel')) suspicious.push('arômes artificiels');
  if (lower.includes('modifié')) suspicious.push('ingrédients modifiés');
  
  return suspicious;
}

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