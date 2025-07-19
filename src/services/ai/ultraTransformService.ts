// PATH: frontend/src/services/ai/ultraTransformService.ts
import { NovaResult } from './novaClassifier';

export interface UltraTransformResult {
  productName: string;
  transformationLevel: number;
  processingMethods: string[];
  industrialMarkers: string[];
  nutritionalImpact: {
    vitaminLoss: number;
    mineralRetention: number;
    proteinDenaturation: number;
    fiberDegradation: number;
    antioxidantLoss: number;
    glycemicIndexIncrease: number;
    neoformedCompounds: 'low' | 'medium' | 'high';
    bioavailabilityImpact: 'positive' | 'neutral' | 'mixed' | 'negative';
  };
  recommendations: string[];
  naturalityMatrix: {
    naturalIngredients: number;
    artificialIngredients: number;
    processingAids: number;
    naturalityScore: number;
  };
  confidence: number;
  scientificSources: string[];
  visualization?: {
    levelColor: string;
    levelIcon: string;
    levelLabel: string;
  };
  metadata?: {
    analysisType: string;
    version: string;
    processingTime: string;
  };
  // Compatibilité avec le composant simplifié
  novaClass?: 1 | 2 | 3 | 4;
  transformationScore?: number;
  additivesCount?: number;
}

export interface CombinedAnalysisResult {
  productName: string;
  nova: NovaResult;
  ultraTransformation: UltraTransformResult;
  holisticScore: number;
  globalAssessment: string;
  recommendations: string[];
  timestamp: string;
}

class UltraTransformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://ecolojia-backend-working.onrender.com';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Analyse Ultra-Transformation d'un produit
   */
  async analyzeUltraTransformation(
    productName: string,
    ingredients: string
  ): Promise<UltraTransformResult> {
    try {
      console.log('🔬 UltraTransformService - Démarrage analyse:', { productName });

      const response = await fetch(`${this.baseUrl}/api/analyze/ultra-transform`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          productName: productName.trim(),
          product_name: productName.trim(), // Compatibilité backend
          ingredients: ingredients.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Extraction du résultat selon la structure de réponse
      const result = data.analysis || data;
      
      console.log('✅ Analyse Ultra-Transformation réussie:', result);

      // Ajout des champs de compatibilité
      const enrichedResult: UltraTransformResult = {
        ...result,
        // Mapping pour le composant simplifié
        novaClass: this.mapTransformLevelToNova(result.transformationLevel),
        transformationScore: this.calculateTransformationScore(result),
        additivesCount: result.industrialMarkers?.filter((m: string) => m.includes('Additif')).length || 0
      };

      return enrichedResult;
    } catch (error: any) {
      console.error('❌ Erreur service Ultra-Transformation:', error);
      
      // Fallback vers analyse locale si backend indisponible
      if (error.message.includes('fetch')) {
        console.log('🔄 Fallback vers analyse locale');
        return this.analyzeLocal(productName, ingredients);
      }
      
      throw error;
    }
  }

  /**
   * Analyse combinée NOVA + Ultra-Transformation
   */
  async analyzeCombined(
    productName: string,
    ingredients: string
  ): Promise<CombinedAnalysisResult> {
    try {
      console.log('🔬 Analyse combinée NOVA + Ultra-Transform:', { productName });

      const response = await fetch(`${this.baseUrl}/api/analyze/combined`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          productName: productName.trim(),
          product_name: productName.trim(), // Compatibilité
          ingredients: ingredients.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const result = data.analysis || data;
      
      console.log('✅ Analyse combinée réussie:', result);

      return result;
    } catch (error: any) {
      console.error('❌ Erreur analyse combinée:', error);
      throw error;
    }
  }

  /**
   * Analyse locale de secours (fallback)
   */
  private analyzeLocal(productName: string, ingredients: string): UltraTransformResult {
    console.log('🔄 Analyse Ultra-Transformation locale');
    
    // Analyse simplifiée locale
    const lower = ingredients.toLowerCase();
    let level = 1;
    const methods: string[] = [];
    const markers: string[] = [];
    
    // Détection basique des méthodes
    if (lower.includes('hydrogéné')) {
      methods.push('hydrogénation');
      level = Math.max(level, 4);
    }
    if (lower.includes('sirop') && lower.includes('glucose')) {
      methods.push('hydrolyse enzymatique');
      level = Math.max(level, 4);
    }
    if (lower.includes('maltodextrine')) {
      markers.push('Ingrédient industriel: maltodextrine');
      level = Math.max(level, 4);
    }
    if (lower.includes('huile') && lower.includes('palme')) {
      methods.push('raffinage intensif');
      markers.push('Ingrédient industriel: huile de palme');
      level = Math.max(level, 4);
    }
    
    // Comptage des additifs E
    const additives = (lower.match(/e\d{3}/g) || []).length;
    if (additives > 5) level = Math.max(level, 4);
    else if (additives > 2) level = Math.max(level, 3);
    
    additives > 0 && markers.push(`${additives} additif(s) technologique(s) détecté(s)`);
    
    // Impact nutritionnel simplifié
    const nutritionalImpact = {
      vitaminLoss: level * 15,
      mineralRetention: 100 - (level * 10),
      proteinDenaturation: level * 12,
      fiberDegradation: level * 10,
      antioxidantLoss: level * 18,
      glycemicIndexIncrease: level >= 3 ? 25 : 10,
      neoformedCompounds: level >= 4 ? 'high' as const : level >= 3 ? 'medium' as const : 'low' as const,
      bioavailabilityImpact: level >= 4 ? 'negative' as const : 'neutral' as const
    };
    
    // Recommandations basiques
    const recommendations = [
      level >= 4 ? '🚨 Ultra-transformation détectée - limiter la consommation' : 
      level >= 3 ? '⚠️ Transformation importante - consommation modérée' :
      '✅ Transformation acceptable',
      '📚 Analyse locale simplifiée - résultats approximatifs',
      '💡 Pour une analyse complète, vérifiez la connexion au serveur'
    ];
    
    return {
      productName,
      transformationLevel: level,
      processingMethods: methods,
      industrialMarkers: markers,
      nutritionalImpact,
      recommendations,
      naturalityMatrix: {
        naturalIngredients: 0,
        artificialIngredients: additives,
        processingAids: 0,
        naturalityScore: additives > 0 ? Math.round(100 / (1 + additives)) : 100
      },
      confidence: 0.6,
      scientificSources: ['Analyse locale basée sur patterns'],
      visualization: {
        levelColor: this.getLevelColor(level),
        levelIcon: this.getLevelIcon(level),
        levelLabel: this.getLevelLabel(level)
      },
      // Compatibilité
      novaClass: this.mapTransformLevelToNova(level),
      transformationScore: level * 20,
      additivesCount: additives
    };
  }

  /**
   * Obtient les informations sur le service
   */
  async getServiceInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze/ultra-transform/info`);
      if (!response.ok) throw new Error('Service info unavailable');
      return await response.json();
    } catch (error) {
      return {
        service: 'Ultra-Transformation Analyzer',
        version: 'local-fallback',
        status: 'limited'
      };
    }
  }

  // Méthodes utilitaires privées
  private getLevelColor(level: number): string {
    switch (level) {
      case 1: return '#10B981';
      case 2: return '#84CC16';
      case 3: return '#F59E0B';
      case 4: return '#F97316';
      case 5: return '#EF4444';
      default: return '#6B7280';
    }
  }

  private getLevelIcon(level: number): string {
    switch (level) {
      case 1: return '🌿';
      case 2: return '🌱';
      case 3: return '⚠️';
      case 4: return '🚨';
      case 5: return '❌';
      default: return '❓';
    }
  }

  private getLevelLabel(level: number): string {
    switch (level) {
      case 1: return 'Minimal';
      case 2: return 'Simple';
      case 3: return 'Important';
      case 4: return 'Ultra';
      case 5: return 'Extrême';
      default: return 'Inconnu';
    }
  }

  // Méthodes de compatibilité
  private mapTransformLevelToNova(transformLevel: number): 1 | 2 | 3 | 4 {
    if (transformLevel <= 1) return 1;
    if (transformLevel === 2) return 2;
    if (transformLevel === 3) return 3;
    return 4;
  }

  private calculateTransformationScore(result: any): number {
    const level = result.transformationLevel || 4;
    const baseScore = level * 20;
    
    // Ajustements basés sur d'autres facteurs
    let score = baseScore;
    
    if (result.nutritionalImpact?.vitaminLoss > 50) score += 10;
    if (result.processingMethods?.length > 3) score += 10;
    if (result.industrialMarkers?.length > 5) score += 10;
    
    return Math.min(100, score);
  }
}

// Export singleton
export const ultraTransformService = new UltraTransformService();

// Export types et classe
export default UltraTransformService;
// EOF