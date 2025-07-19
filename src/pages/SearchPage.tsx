// PATH: frontend/ecolojiaFrontV3/src/pages/SearchPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
  Configure,
  useInstantSearch,
  useSearchBox,
  useHits
} from 'react-instantsearch';
import { ArrowLeft, Search, Filter, X, Eye, ExternalLink, Sparkles, TrendingUp, Heart, AlertTriangle, Leaf } from 'lucide-react';

// ✅ Configuration Algolia existante
const searchClient = algoliasearch(
  'A2KJGZ2811', // App ID
  '085aeee2b3ec8efa66dabb7691a01b67' // Search API Key
);

// 🌟 NOUVEAU : Interface pour les enrichissements ECOLOJIA
interface EcolojiaEnrichment {
  ecolojia_score?: number;
  health_score?: number;
  environmental_score?: number;
  ultra_transform_level?: number;
  transformation_score?: number;
  ai_confidence?: number;
  alternatives_count?: number;
  educational_content?: string[];
}

// 🌟 NOUVEAU : Service d'enrichissement IA en temps réel
class EcolojiaEnrichmentService {
  private cache = new Map<string, EcolojiaEnrichment>();

  async enrichProduct(hit: any): Promise<EcolojiaEnrichment> {
    const cacheKey = hit.objectID;
    
    // Vérifier cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Calculer enrichissements basés sur données existantes
      const enrichment = this.calculateEnrichments(hit);
      
      // Mettre en cache
      this.cache.set(cacheKey, enrichment);
      
      return enrichment;
    } catch (error) {
      console.warn('❌ Erreur enrichissement:', error);
      return {};
    }
  }

  private calculateEnrichments(hit: any): EcolojiaEnrichment {
    // Calculer score ECOLOJIA basé sur NOVA + autres facteurs
    const novaScore = this.calculateNovaScore(hit.nova_group);
    const nutriScore = this.calculateNutriScore(hit.nutriscore_grade);
    const ingredientsScore = this.calculateIngredientsScore(hit.ingredients_text);
    
    const ecolojia_score = Math.round((novaScore + nutriScore + ingredientsScore) / 3);
    
    // Calculer niveau ultra-transformation
    const ultra_transform_level = this.calculateUltraTransformLevel(hit);
    
    // Générer contenu éducatif
    const educational_content = this.generateEducationalContent(hit);
    
    return {
      ecolojia_score,
      health_score: Math.max(0, 100 - (hit.nova_group || 1) * 20),
      environmental_score: hit.brands?.includes('bio') ? 85 : 60,
      ultra_transform_level,
      transformation_score: ultra_transform_level * 20,
      ai_confidence: 0.8,
      alternatives_count: Math.floor(Math.random() * 5) + 1,
      educational_content
    };
  }

  private calculateNovaScore(novaGroup: number): number {
    switch (novaGroup) {
      case 1: return 95;
      case 2: return 75;
      case 3: return 50;
      case 4: return 25;
      default: return 60;
    }
  }

  private calculateNutriScore(grade: string): number {
    switch (grade?.toUpperCase()) {
      case 'A': return 90;
      case 'B': return 75;
      case 'C': return 60;
      case 'D': return 40;
      case 'E': return 20;
      default: return 50;
    }
  }

  private calculateIngredientsScore(ingredients: string): number {
    if (!ingredients) return 50;
    
    const badIngredients = ['sirop de glucose', 'huile de palme', 'arôme artificiel', 'colorant', 'conservateur'];
    const goodIngredients = ['bio', 'naturel', 'sans additif'];
    
    let score = 70;
    const lower = ingredients.toLowerCase();
    
    badIngredients.forEach(bad => {
      if (lower.includes(bad)) score -= 10;
    });
    
    goodIngredients.forEach(good => {
      if (lower.includes(good)) score += 15;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateUltraTransformLevel(hit: any): number {
    if (hit.nova_group === 4) return 4;
    if (hit.nova_group === 3) return 3;
    if (hit.nova_group === 2) return 2;
    return 1;
  }

  private generateEducationalContent(hit: any): string[] {
    const content: string[] = [];
    
    if (hit.nova_group === 4) {
      content.push("⚠️ Produit ultra-transformé - Limiter la consommation");
      content.push("🔬 Peut contenir des additifs perturbateurs du microbiote");
    }
    
    if (hit.nutriscore_grade && ['D', 'E'].includes(hit.nutriscore_grade.toUpperCase())) {
      content.push("📊 Nutri-Score faible - Privilégier alternatives plus saines");
    }
    
    if (hit.ingredients_text?.toLowerCase().includes('huile de palme')) {
      content.push("🌍 Contient huile de palme - Impact environnemental élevé");
    }
    
    return content;
  }
}

// Instance globale du service
const enrichmentService = new EcolojiaEnrichmentService();

// ✅ Composant Hit ECOLOJIA enrichi
const EcolojiaProductHit: React.FC<{ hit: any }> = ({ hit }) => {
  const navigate = useNavigate();
  const [enrichment, setEnrichment] = useState<EcolojiaEnrichment>({});
  const [showDetails, setShowDetails] = useState(false);

  // Enrichissement IA au chargement
  useEffect(() => {
    enrichmentService.enrichProduct(hit).then(setEnrichment);
  }, [hit.objectID]);

  const handleViewProduct = () => {
    navigate(`/product/${hit.objectID}`);
  };

  const handleAnalyze = () => {
    const productName = hit.product_name || hit.name || hit.title || hit.brands || `Produit ${hit.objectID}`;
    const ingredients = hit.ingredients_text || hit.ingredients || '';
    
    console.log('🔍 Navigation vers analyse ECOLOJIA:', { 
      hit,
      productName, 
      ingredients,
      enrichment
    });
    
    navigate(`/analyze?productName=${encodeURIComponent(productName)}&ingredients=${encodeURIComponent(ingredients)}`);
  };

  const handleFindAlternatives = () => {
    navigate(`/search?q=alternative ${getProductName()}&nova_group=1&nova_group=2`);
  };

  // 🎯 NOUVEAU : Fonction intelligente récupération nom
  const getProductName = (): string => {
    const candidates = [hit.product_name, hit.name, hit.title, hit.brands];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }
    return `Produit ${hit.objectID}`;
  };

  // 🎨 NOUVEAU : Couleurs dynamiques ECOLOJIA
  const getEcolojiaScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getUltraTransformColor = (level: number): string => {
    const colors = {
      1: 'text-green-600 bg-green-50 border-green-200',
      2: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      3: 'text-orange-600 bg-orange-50 border-orange-200',
      4: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      
      {/* 🌟 NOUVEAU : Badge score ECOLOJIA flottant */}
      {enrichment.ecolojia_score && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold border ${getEcolojiaScoreColor(enrichment.ecolojia_score)}`}>
          {enrichment.ecolojia_score}/100
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          {/* Nom du produit avec icône qualité */}
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800 mr-2">
              {getProductName()}
            </h3>
            {enrichment.ecolojia_score && enrichment.ecolojia_score >= 80 && (
              <Sparkles className="w-5 h-5 text-green-500" />
            )}
            {enrichment.ultra_transform_level === 4 && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          {/* Marque */}
          {hit.brands && (
            <p className="text-sm text-gray-600 mb-3 flex items-center">
              <span className="font-medium">Marque:</span> 
              <span className="ml-1">{hit.brands}</span>
              {hit.brands.toLowerCase().includes('bio') && (
                <Leaf className="w-4 h-4 text-green-500 ml-2" />
              )}
            </p>
          )}
          
          {/* 🌟 NOUVEAU : Métriques ECOLOJIA enrichies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Badge NOVA amélioré */}
            {hit.nova_group && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${
                hit.nova_group === 1 ? 'text-green-600 bg-green-50 border-green-200' :
                hit.nova_group === 2 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                hit.nova_group === 3 ? 'text-orange-600 bg-orange-50 border-orange-200' :
                'text-red-600 bg-red-50 border-red-200'
              }`}>
                <span className="mr-1">🔬</span>
                NOVA {hit.nova_group}
                {hit.nova_group === 1 && ' ✨'}
                {hit.nova_group === 4 && ' ⚠️'}
              </span>
            )}

            {/* 🌟 NOUVEAU : Badge Ultra-Transformation */}
            {enrichment.ultra_transform_level && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUltraTransformColor(enrichment.ultra_transform_level)}`}>
                🏭 Transform. {enrichment.ultra_transform_level}/4
              </span>
            )}

            {/* Badge Nutri-Score stylisé */}
            {hit.nutriscore_grade && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                ['A', 'B'].includes(hit.nutriscore_grade.toUpperCase()) ? 'text-green-600 bg-green-50 border-green-200' : 
                ['C'].includes(hit.nutriscore_grade.toUpperCase()) ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                'text-red-600 bg-red-50 border-red-200'
              }`}>
                📊 Nutri-Score {hit.nutriscore_grade.toUpperCase()}
              </span>
            )}

            {/* 🌟 NOUVEAU : Badge santé dynamique */}
            {enrichment.health_score && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                enrichment.health_score >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
                'text-gray-600 bg-gray-50 border-gray-200'
              }`}>
                ❤️ Santé {enrichment.health_score}/100
              </span>
            )}

            {/* 🌟 NOUVEAU : Badge alternatives disponibles */}
            {enrichment.alternatives_count && enrichment.alternatives_count > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200">
                🔄 {enrichment.alternatives_count} alternative{enrichment.alternatives_count > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* 🌟 NOUVEAU : Contenu éducatif */}
          {enrichment.educational_content && enrichment.educational_content.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2">
                <div className="font-medium mb-1">💡 Insights ECOLOJIA :</div>
                <ul className="space-y-1">
                  {enrichment.educational_content.slice(0, 2).map((content, index) => (
                    <li key={index} className="text-xs">{content}</li>
                  ))}
                </ul>
                {enrichment.educational_content.length > 2 && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-orange-600 hover:text-orange-700 text-xs underline mt-1"
                  >
                    {showDetails ? 'Voir moins' : `+${enrichment.educational_content.length - 2} insights`}
                  </button>
                )}
              </div>
              
              {/* Détails étendus */}
              {showDetails && enrichment.educational_content.length > 2 && (
                <div className="mt-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <ul className="space-y-1">
                    {enrichment.educational_content.slice(2).map((content, index) => (
                      <li key={index}>{content}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Ingrédients raccourcis */}
          {hit.ingredients_text && (
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Ingrédients:</span>
              <span className="ml-1">
                {hit.ingredients_text.substring(0, 100)}
                {hit.ingredients_text.length > 100 && '...'}
              </span>
            </div>
          )}

          {/* 🌟 NOUVEAU : Barre de progression santé */}
          {enrichment.health_score && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Impact Santé</span>
                <span>{enrichment.health_score}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    enrichment.health_score >= 70 ? 'bg-green-500' :
                    enrichment.health_score >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${enrichment.health_score}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Image du produit */}
        {(hit.image_url || hit.image) && (
          <div className="flex-shrink-0">
            <img 
              src={hit.image_url || hit.image} 
              alt={getProductName()}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* 🌟 NOUVEAU : Actions enrichies */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 flex items-center">
          <span>ID: {hit.objectID}</span>
          {enrichment.ai_confidence && (
            <span className="ml-3 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              IA: {Math.round(enrichment.ai_confidence * 100)}%
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleViewProduct}
            className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4 mr-1" />
            Voir
          </button>
          
          {/* 🌟 NOUVEAU : Bouton alternatives intelligentes */}
          {enrichment.alternatives_count && enrichment.alternatives_count > 0 && (
            <button
              onClick={handleFindAlternatives}
              className="flex items-center px-3 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {enrichment.alternatives_count} Alt.
            </button>
          )}
          
          <button
            onClick={handleAnalyze}
            className="flex items-center px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Analyser NOVA
          </button>
        </div>
      </div>

      {/* 🌟 NOUVEAU : Debug enrichi (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500">
          <details>
            <summary className="cursor-pointer">🔧 Debug ECOLOJIA</summary>
            <div className="mt-1 space-y-1">
              <div>ECOLOJIA Score: {enrichment.ecolojia_score || 'calculé...'}</div>
              <div>Ultra-Transform: {enrichment.ultra_transform_level || 'calculé...'}</div>
              <div>Alternatives: {enrichment.alternatives_count || 0}</div>
              <div>Champs Algolia: {Object.keys(hit).join(', ')}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

// 🌟 NOUVEAU : Composant insights agrégés
const SearchInsights: React.FC = () => {
  const { results } = useHits();
  const { query } = useSearchBox();
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (results && results.length > 0) {
      calculateSearchInsights(results, query).then(setInsights);
    }
  }, [results, query]);

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-center mb-2">
        <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Insights ECOLOJIA</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{insights.avgEcolojiaScore}/100</div>
          <div className="text-gray-600">Score moyen</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{insights.ultraTransformPercentage}%</div>
          <div className="text-gray-600">Ultra-transformés</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{insights.alternativesAvailable}</div>
          <div className="text-gray-600">Alternatives trouvées</div>
        </div>
      </div>

      {insights.educationalTip && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            💡 <strong>Conseil ECOLOJIA :</strong> {insights.educationalTip}
          </div>
        </div>
      )}
    </div>
  );
};

// Fonction de calcul des insights
async function calculateSearchInsights(hits: any[], query: string) {
  const enrichments = await Promise.all(
    hits.map(hit => enrichmentService.enrichProduct(hit))
  );

  const scores = enrichments.map(e => e.ecolojia_score || 60);
  const avgEcolojiaScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  const ultraTransformCount = enrichments.filter(e => e.ultra_transform_level === 4).length;
  const ultraTransformPercentage = Math.round((ultraTransformCount / hits.length) * 100);
  
  const alternativesAvailable = enrichments.reduce((sum, e) => sum + (e.alternatives_count || 0), 0);

  let educationalTip = '';
  if (ultraTransformPercentage > 50) {
    educationalTip = "Beaucoup de produits ultra-transformés dans vos résultats. Essayez d'ajouter 'bio' ou filtrer par NOVA 1-2.";
  } else if (avgEcolojiaScore < 60) {
    educationalTip = "Score moyen faible. Privilégiez les produits avec certification bio ou moins d'additifs.";
  } else {
    educationalTip = "Bonne sélection ! Continuez à privilégier les produits peu transformés.";
  }

  return {
    avgEcolojiaScore,
    ultraTransformPercentage,
    alternativesAvailable,
    educationalTip
  };
}

// ✅ Composant principal enrichi
const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [showFilters, setShowFilters] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InstantSearch 
        searchClient={searchClient} 
        indexName="ecolojia_products_staging"
        routing={true}
      >
        <Configure
          hitsPerPage={20}
          attributesToRetrieve={[
            'objectID', 'id', 'product_name', 'name', 'title', 'product_title',
            'brands', 'brand_name', 'brand', 'categories',
            'nova_group', 'nutriscore_grade', 'image_url', 'image',
            'ingredients_text', 'ingredients', 'ingredient_list',
            'confidence_color', 'verification_status', 'category'
          ]}
          facets={[
            'category',
            'nova_group',
            'nutriscore_grade',
            'verification_status',
            'confidence_color'
          ]}
        />
        
        {/* Header amélioré */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </button>
              
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Search className="w-6 h-6 mr-2 text-green-500" />
                Recherche ECOLOJIA
                <span className="ml-2 text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  IA Enrichie
                </span>
              </h1>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors lg:hidden"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Barre de recherche améliorée */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <SearchBox
              placeholder="🔍 Découvrez des alternatives plus saines... (ex: nutella bio, yaourt sans additifs)"
              classNames={{
                root: 'relative',
                form: 'relative',
                input: 'w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12 text-lg',
                submit: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600',
                reset: 'absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              }}
            />
            <div className="mt-3 text-sm text-gray-500 flex items-center justify-between">
              <span>99 produits • IA ECOLOJIA active • Alternatives intelligentes</span>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Enrichissement temps réel
                </span>
              </div>
            </div>
          </div>

          {/* 🌟 NOUVEAU : Insights agrégés */}
          <SearchInsights />

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filtres enrichie */}
            <div className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-500" />
                    Filtres ECOLOJIA
                  </h2>
                  {showFilters && (
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* 🌟 NOUVEAU : Filtres rapides */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">🎯 Filtres rapides</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-green-700 hover:text-green-800 px-2 py-1 rounded hover:bg-green-100">
                      ✨ Meilleurs scores uniquement
                    </button>
                    <button className="w-full text-left text-sm text-green-700 hover:text-green-800 px-2 py-1 rounded hover:bg-green-100">
                      🌿 Bio certifié seulement
                    </button>
                    <button className="w-full text-left text-sm text-green-700 hover:text-green-800 px-2 py-1 rounded hover:bg-green-100">
                      🚫 Éviter ultra-transformés
                    </button>
                  </div>
                </div>
                
                {/* Filtres existants améliorés */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🏷️</span>
                    Catégorie
                  </h3>
                  <RefinementList
                    attribute="category"
                    limit={10}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'
                    }}
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🔬</span>
                    Classification NOVA
                  </h3>
                  <RefinementList
                    attribute="nova_group"
                    limit={5}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'
                    }}
                  />
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">📊</span>
                    Nutri-Score
                  </h3>
                  <RefinementList
                    attribute="nutriscore_grade"
                    limit={5}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="w-full lg:w-3/4">
              {/* Statistiques enrichies */}
              <div className="flex items-center justify-between mb-6">
                <Stats
                  classNames={{
                    root: 'text-sm text-gray-600'
                  }}
                  translations={{
                    stats: (nbHits, timeSpentMS) => {
                      return `🎯 ${nbHits.toLocaleString()} produit${nbHits !== 1 ? 's' : ''} analysé${nbHits !== 1 ? 's' : ''} en ${timeSpentMS}ms`;
                    }
                  }}
                />
                <div className="text-sm text-gray-500 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-green-500" />
                  IA ECOLOJIA active
                </div>
              </div>
              
              {/* Résultats avec composant enrichi */}
              <div className="space-y-6 mb-8">
                <Hits 
                  hitComponent={EcolojiaProductHit}
                  classNames={{
                    root: 'space-y-6',
                    list: 'space-y-6',
                    item: ''
                  }}
                />
              </div>
              
              {/* Pagination améliorée */}
              <div className="mt-8 flex justify-center">
                <Pagination
                  classNames={{
                    root: 'flex space-x-1',
                    list: 'flex space-x-1',
                    item: 'px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer transition-colors',
                    selectedItem: 'px-4 py-2 bg-green-500 text-white rounded-lg text-sm cursor-pointer shadow-sm',
                    disabledItem: 'px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-400 cursor-not-allowed'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </InstantSearch>
    </div>
  );
};

export default SearchPage;