// src/services/multiCategoryApi.ts
// Service pour appeler l'API multi-catégories ECOLOJIA

const API_BASE_URL = 'https://ecolojia-backend-working.onrender.com';

// Types TypeScript
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  available: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
  total_categories: number;
  default_category: string;
  api_version: string;
  timestamp: string;
}

export interface AnalysisRequest {
  product: {
    title: string;
    brand?: string;
    description?: string;
    ingredients?: string[];
    category?: string;
  };
  context?: {
    userId?: string;
    anonymousId?: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  category: string;
  detection_confidence: number;
  analysis: {
    overall_score: number;
    detailed_analysis?: any;
    confidence: number;
    sources: string[];
  };
  alternatives: any[];
  metadata: {
    processing_time_ms: number;
    api_version: string;
    request_id: string;
    timestamp: string;
  };
}

// Service principal
export class MultiCategoryApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Récupérer les catégories disponibles
  async getCategories(): Promise<CategoriesResponse> {
    try {
      console.log('🔍 Récupération catégories depuis:', `${this.baseUrl}/api/multi-category/categories`);
      
      const response = await fetch(`${this.baseUrl}/api/multi-category/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CategoriesResponse = await response.json();
      console.log('✅ Catégories récupérées:', data.categories?.length || 0);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      throw new Error(`Impossible de récupérer les catégories: ${error}`);
    }
  }

  // Analyser un produit
  async analyzeProduct(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      console.log('🧪 Analyse produit:', request.product.title);
      
      const enrichedRequest = {
        ...request,
        context: {
          ...request.context,
          anonymousId: request.context?.anonymousId || this.generateAnonymousId(),
        }
      };

      const response = await fetch(`${this.baseUrl}/api/multi-category/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      console.log('✅ Analyse terminée:', data.category, 'Score:', data.analysis?.overall_score);
      
      return data;
    } catch (error) {
      console.error('❌ Erreur analyse produit:', error);
      throw new Error(`Analyse échouée: ${error}`);
    }
  }

  // Données de test pour chaque catégorie
  getTestData(): Record<string, AnalysisRequest> {
    return {
      food: {
        product: {
          title: "Céréales Bio aux Fruits",
          brand: "Nature & Progrès",
          description: "Céréales biologiques avec additifs et sucres ajoutés",
          ingredients: ["avoine bio", "sucre", "colorant naturel", "conservateur e200"],
          category: "food"
        },
        context: {
          userId: "test-food-user"
        }
      },
      
      cosmetics: {
        product: {
          title: "Shampooing Doux Bio",
          brand: "Cosmébio",
          description: "Shampooing avec sodium lauryl sulfate et parfum",
          ingredients: ["aqua", "sodium lauryl sulfate", "parfum", "glycerin", "limonene"],
          category: "cosmetics"
        },
        context: {
          userId: "test-cosmetics-user"
        }
      },
      
      detergents: {
        product: {
          title: "Lessive Écologique Concentrée",
          brand: "EcoVert",
          description: "Lessive avec tensioactifs végétaux et enzymes",
          ingredients: ["tensioactifs végétaux", "enzymes", "parfum", "zeolites", "conservateur"],
          category: "detergents"
        },
        context: {
          userId: "test-detergents-user"
        }
      }
    };
  }

  // Test de connectivité
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  // Utilitaires
  private generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instance par défaut
export const multiCategoryApi = new MultiCategoryApiService();

// Export des types pour utilisation dans les composants
export type { AnalysisRequest, AnalysisResponse, Category, CategoriesResponse };
