// PATH: frontend/src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Search, X, ChevronDown, Filter, Grid, List } from 'lucide-react';

import ProductHit from '../components/ProductHit';
import ScanFloatingButton from '../components/ScanFloatingButton';
// Correction de l'import - utiliser la fonction disponible dans realApi
import { fetchRealProducts as fetchProducts } from '../api/realApi';

// Interface Product simplifiée
interface Product {
  id: string;
  nameKey: string;
  brandKey?: string;
  descriptionKey: string;
  ethicalScore: number;
  category: string;
  price: number;
  currency: string;
  image: string;
  tagsKeys: string[];
  verified: boolean;
  affiliateLink: string;
  certificationsKeys: string[];
  aiConfidence: number;
  zonesDisponibles: string[];
  slug: string;
  resumeFr?: string;
  confidencePct?: number;
  confidenceColor?: string;
  verifiedStatus?: string;
}

// Composant NoResultsFound
const NoResultsFound: React.FC<{ query: string; onEnrichRequest: (query: string) => void }> = ({ query, onEnrichRequest }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Aucun produit trouvé pour "{query}"
      </h3>
      <p className="text-gray-600 mb-4">
        Essayez d'autres termes de recherche ou explorez nos catégories
      </p>
      <button
        onClick={() => onEnrichRequest(query)}
        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        Suggérer ce produit à notre équipe
      </button>
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États de recherche
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [originalResults, setOriginalResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get('q'));
  const [searchStats, setSearchStats] = useState({ nbHits: 0, processingTimeMS: 0 });
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hitsPerPage] = useState(12);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ecoScore: '', zone: '', confidence: '' });

  const currentQuery = searchParams.get('q') || '';

  // 🔧 FONCTION: Génération de slug sécurisée
  const generateSecureSlug = useCallback((product: any): string => {
    // 1. Vérifier slug existant
    if (product.slug && 
        typeof product.slug === 'string' && 
        product.slug.trim() !== '' && 
        product.slug !== 'undefined' && 
        product.slug !== 'null') {
      return product.slug.trim();
    }
    
    // 2. Générer depuis le titre
    const title = product.nameKey || product.title || '';
    if (title && typeof title === 'string' && title.trim() !== '') {
      const generatedSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
        .replace(/[^a-z0-9\s-]/g, '')   // Garder alphanumériques
        .replace(/\s+/g, '-')           // Espaces → tirets
        .replace(/-+/g, '-')            // Tirets multiples → simple
        .replace(/^-|-$/g, '');         // Supprimer tirets début/fin
      
      if (generatedSlug && generatedSlug !== 'undefined' && generatedSlug.length > 0) {
        return generatedSlug;
      }
    }
    
    // 3. Utiliser l'ID comme fallback
    const id = product.id || product.objectID || '';
    if (id && typeof id === 'string' && id !== 'undefined' && id.trim() !== '') {
      return `product-${id}`;
    }
    
    // 4. Fallback ultime d'urgence
    return `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Fonction pour adapter les données du backend
  const adaptBackendProduct = (p: any): Product => {
    return {
      id: p.id || `product-${Date.now()}`,
      nameKey: p.title || p.nameKey || 'Produit inconnu',
      brandKey: p.brand || p.brandKey || '',
      descriptionKey: p.description || p.descriptionKey || p.resume_fr || '',
      ethicalScore: parseFloat(p.eco_score) || p.ethicalScore || 0,
      category: p.category || 'inconnu',
      price: p.prices?.default || p.price || 0,
      currency: 'EUR',
      image: p.image_url || p.image || 'https://via.assets.so/img.jpg?w=300&h=200&tc=gray&bg=%23f3f4f6',
      tagsKeys: p.tags || p.tagsKeys || [],
      verified: p.verified_status === 'verified' || p.verified_status === 'ai_verified' || p.verified || false,
      affiliateLink: p.affiliateLink || '',
      certificationsKeys: p.certificationsKeys || [],
      aiConfidence: parseFloat(p.ai_confidence) || p.aiConfidence || 0,
      zonesDisponibles: p.zones_dispo || p.zonesDisponibles || ['FR'],
      slug: p.slug || generateSecureSlug(p),
      resumeFr: p.resume_fr,
      confidencePct: p.confidence_pct,
      confidenceColor: p.confidence_color,
      verifiedStatus: p.verified_status,
    };
  };

  // Fonction pour paginer les résultats côté client
  const paginateResults = (results: Product[], page: number) => {
    const startIndex = page * hitsPerPage;
    const endIndex = startIndex + hitsPerPage;
    return results.slice(startIndex, endIndex);
  };

  // Chargement initial des produits
  const loadInitialProducts = async () => {
    try {
      setIsSearching(true);
      const startTime = Date.now();
      
      // Utiliser la fonction disponible dans realApi
      const backendResults = await fetchProducts('');
      const results = backendResults.map(adaptBackendProduct);
      
      const processingTime = Date.now() - startTime;
      
      setAllResults(results);
      setSearchResults(paginateResults(results, 0));
      setOriginalResults(results);
      setTotalPages(Math.ceil(results.length / hitsPerPage));
      setCurrentPage(0);
      setSearchStats({ 
        nbHits: results.length, 
        processingTimeMS: processingTime 
      });

    } catch (error) {
      console.error('Erreur chargement initial:', error);
      setAllResults([]);
      setSearchResults([]);
      setOriginalResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Fonction de recherche
  const performSearch = async (searchQuery: string, page: number = 0) => {
    if (searchQuery.length === 0) {
      loadInitialProducts();
      return;
    }

    try {
      setIsSearching(true);
      const startTime = Date.now();
      
      const backendResults = await fetchProducts(searchQuery);
      const results = backendResults.map(adaptBackendProduct);
      
      const processingTime = Date.now() - startTime;
      
      setAllResults(results);
      setSearchResults(paginateResults(results, page));
      setOriginalResults(results);
      setTotalPages(Math.ceil(results.length / hitsPerPage));
      setCurrentPage(page);
      setSearchStats({ 
        nbHits: results.length, 
        processingTimeMS: processingTime 
      });
      
    } catch (error) {
      console.error('Erreur recherche:', error);
      setAllResults([]);
      setSearchResults([]);
      setOriginalResults([]);
      setSearchStats({ nbHits: 0, processingTimeMS: 0 });
    } finally {
      setIsSearching(false);
    }
  };

  // Chargement initial des produits
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      performSearch(query, 0);
    } else {
      loadInitialProducts();
    }
  }, []);

  // Écouter les changements d'URL pour les recherches
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.length >= 2) {
      setHasSearched(true);
      performSearch(query, 0);
    } else if (!query) {
      setHasSearched(false);
      loadInitialProducts();
    }
  }, [searchParams]);

  // Navigation fluide vers les résultats
  const scrollToResults = () => {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Gestion des événements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setSearchParams({});
    setFilters({ ecoScore: '', zone: '', confidence: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentQuery = searchParams.get('q') || '';
    if (currentQuery.trim()) {
      setTimeout(scrollToResults, 100);
    }
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setFilters({ ecoScore: '', zone: '', confidence: '' });
    const paginatedResults = paginateResults(allResults, newPage);
    setSearchResults(paginatedResults);
    setCurrentPage(newPage);
    setTimeout(scrollToResults, 100);
  };

  // 🎯 FONCTION CRITIQUE: Navigation vers produit
  const handleProductClick = (product: Product) => {
    console.log('🔗 Navigation vers produit:', product);
    
    // Générer slug sécurisé
    const secureSlug = generateSecureSlug(product);
    
    // Validation finale avant navigation
    if (secureSlug && secureSlug !== 'undefined' && secureSlug.trim() !== '') {
      console.log('✅ Navigation vers:', `/product/${secureSlug}`);
      navigate(`/product/${secureSlug}`);
    } else {
      console.error('❌ Navigation bloquée - slug invalide:', secureSlug);
    }
  };

  // Fonction pour enrichir la base de données
  const handleEnrichRequest = async (searchQuery: string) => {
    try {
      // Note: Ajuster l'URL API selon votre configuration
      const apiUrl = import.meta.env.VITE_API_URL || 'https://ecolojia-backend-working.onrender.com';
      const response = await fetch(`${apiUrl}/api/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (response.ok) {
        setTimeout(() => {
          performSearch(searchQuery, 0);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur enrichissement:', error);
    }
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    let filteredResults = [...originalResults];
    
    if (filters.ecoScore) {
      filteredResults = filteredResults.filter(product => 
        product.ethicalScore && product.ethicalScore >= parseFloat(filters.ecoScore)
      );
    }
    
    if (filters.zone) {
      filteredResults = filteredResults.filter(product => 
        product.zonesDisponibles && product.zonesDisponibles.includes(filters.zone)
      );
    }
    
    if (filters.confidence) {
      filteredResults = filteredResults.filter(product => 
        product.confidencePct && product.confidencePct >= parseFloat(filters.confidence)
      );
    }
    
    setSearchResults(filteredResults);
    setSearchStats({ ...searchStats, nbHits: filteredResults.length });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ ecoScore: '', zone: '', confidence: '' });
    setSearchResults(paginateResults(originalResults, currentPage));
    setSearchStats({ ...searchStats, nbHits: originalResults.length });
  };

  const hasActiveFilters = filters.ecoScore || filters.zone || filters.confidence;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Section Hero */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Leaf className="h-16 w-16 text-green-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Trouvez des produits <span className="text-green-500">éco-responsables</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Découvrez des milliers de produits éthiques avec des scores écologiques vérifiés par IA
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={currentQuery}
                onChange={handleInputChange}
                placeholder="Rechercher shampoing bio, jean éthique, miel local..."
                className="w-full py-4 px-12 pr-16 border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 placeholder-gray-500 bg-white"
                autoComplete="off"
              />
              
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              
              {isSearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-green-300 border-t-green-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {currentQuery && !isSearching && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Indicateurs de recherche */}
            {currentQuery && currentQuery.length >= 2 && (
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Recherche en cours...
                </div>
              </div>
            )}
            
            {!hasSearched && currentQuery.length === 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={scrollToResults}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all group hover:scale-105"
                >
                  <span>Découvrir nos produits</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </form>

          {hasSearched && !isSearching && searchStats.nbHits > 0 && (
            <div className="text-gray-500 text-sm">
              {searchStats.nbHits === 1 
                ? `1 résultat trouvé en ${searchStats.processingTimeMS}ms`
                : `${searchStats.nbHits} résultats trouvés en ${searchStats.processingTimeMS}ms`
              }
            </div>
          )}
        </div>
      {/* Bouton scanner flottant PWA */}
      <ScanFloatingButton />
    </div>
  );
};

export default HomePage;

      {/* RÉSULTATS */}
      <section id="results-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header résultats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {currentQuery ? `Résultats pour "${currentQuery}"` : 'Produits éco-responsables'}
              </h2>
              <p className="text-gray-600">
                {searchStats.nbHits === 1 ? 
                  `1 produit trouvé` :
                  `${searchStats.nbHits} produits trouvés`
                }
                {hasSearched ? ` correspondant à votre recherche` : ` disponibles`}
                {hasActiveFilters && (
                  <span className="text-green-500"> ({searchStats.nbHits > 1 ? 'filtrés' : 'filtré'})</span>
                )}
                {totalPages > 1 && (
                  <span className="text-gray-400"> • Page {currentPage + 1} sur {totalPages}</span>
                )}
              </p>
            </div>

            {/* Boutons vue + filtre */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  hasActiveFilters 
                    ? 'border-green-500 bg-green-50 text-green-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[filters.ecoScore, filters.zone, filters.confidence].filter(Boolean).length}
                  </span>
                )}
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'hover:bg-gray-50'}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'hover:bg-gray-50'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtrer les résultats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Filtre par score écologique */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score écologique minimum
                  </label>
                  <select 
                    value={filters.ecoScore}
                    onChange={(e) => setFilters({...filters, ecoScore: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les scores</option>
                    <option value="0.8">Excellent (80%+)</option>
                    <option value="0.6">Très bon (60%+)</option>
                    <option value="0.4">Bon (40%+)</option>
                  </select>
                </div>

                {/* Filtre par zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone de disponibilité
                  </label>
                  <select 
                    value={filters.zone}
                    onChange={(e) => setFilters({...filters, zone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Toutes les zones</option>
                    <option value="FR">France</option>
                    <option value="EU">Europe</option>
                    <option value="US">États-Unis</option>
                  </select>
                </div>

                {/* Filtre par confiance IA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confiance IA
                  </label>
                  <select 
                    value={filters.confidence}
                    onChange={(e) => setFilters({...filters, confidence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="0.8">Certifié (80%+)</option>
                    <option value="0.6">Validé (60%+)</option>
                    <option value="0.4">En analyse (40%+)</option>
                  </select>
                </div>
              </div>
              
              {/* Boutons d'action des filtres */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Masquer les filtres
                </button>
                <div className="space-x-3">
                  <button 
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenu principal */}
          {isSearching && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-green-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Recherche en cours...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {/* Grille de produits */}
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {searchResults.map((product, index) => {
                  // Validation stricte des données produit
                  if (!product || !product.id) {
                    if (import.meta.env.DEV) {
                      console.warn('Produit invalide ignoré:', product);
                    }
                    return null;
                  }

                  return (
                    <div
                      key={`${product.id}-${index}`}
                      className="cursor-pointer animate-fade-in-up"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                      onClick={() => handleProductClick(product)}
                    >
                      <ProductHit 
                        hit={{
                          objectID: product.id,
                          title: product.nameKey || 'Produit sans titre',
                          description: product.descriptionKey || '',
                          brand: product.brandKey || '',
                          category: product.category || '',
                          image_url: product.image || '',
                          eco_score: product.ethicalScore || 0,
                          slug: generateSecureSlug(product),
                          tags: product.tagsKeys || [],
                          zones_dispo: product.zonesDisponibles || [],
                          verified_status: product.verifiedStatus || 'manual_review',
                          ai_confidence: product.aiConfidence || 0,
                          confidence_pct: product.confidencePct || 0,
                          confidence_color: product.confidenceColor || 'yellow',
                          price: product.price || 0
                        }}
                        viewMode={viewMode}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-16 space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            pageNum === currentPage
                              ? 'bg-green-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : hasSearched ? (
            <NoResultsFound query={currentQuery} onEnrichRequest={handleEnrichRequest} />
          ) : (
            <div className="text-center py-12">
              <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Aucun produit disponible
              </h3>
              <p className="text-gray-600">
                Revenez plus tard pour découvrir nos produits éco-responsables
              </p>
            </div>
          )}
        </div>
      </section>