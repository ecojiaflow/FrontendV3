// /src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Search, X, ChevronDown, Filter, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductHit from '../components/ProductHit';
import { fetchRealProducts } from '../api/realApi';
import { Product } from '../types';

// Composant NoResultsFound
const NoResultsFound: React.FC<{ query: string; onEnrichRequest: (query: string) => void }> = ({ query, onEnrichRequest }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-eco-text mb-2">
        Aucun produit trouvé pour "{query}"
      </h3>
      <p className="text-eco-text/70 mb-4">
        Essayez d'autres termes de recherche ou explorez nos catégories
      </p>
      <button
        onClick={() => onEnrichRequest(query)}
        className="px-6 py-2 bg-eco-leaf text-white rounded-lg hover:bg-eco-leaf/90 transition-colors"
      >
        Suggérer ce produit à notre équipe
      </button>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
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
      const results = await fetchRealProducts('');
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Produits chargés:', results.length);
      
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
      console.error('❌ Erreur chargement initial:', error);
      setAllResults([]);
      setSearchResults([]);
      setOriginalResults([]);
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

  // Fonction de recherche
  const performSearch = async (searchQuery: string, page: number = 0) => {
    if (searchQuery.length === 0) {
      loadInitialProducts();
      return;
    }

    try {
      setIsSearching(true);
      const startTime = Date.now();
      const results = await fetchRealProducts(searchQuery);
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
      console.error('❌ Erreur recherche:', error);
      setAllResults([]);
      setSearchResults([]);
      setOriginalResults([]);
      setSearchStats({ nbHits: 0, processingTimeMS: 0 });
    } finally {
      setIsSearching(false);
    }
  };

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
    console.log('📝 Suggestion produit:', searchQuery);
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
      <section className="bg-eco-gradient py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Leaf className="h-16 w-16 text-eco-leaf animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-eco-text mb-6">
            {t('homepage.hero.title') === 'Find <highlight>eco-friendly</highlight> products' ? (
              <>Find <span className="text-eco-leaf">eco-friendly</span> products</>
            ) : (
              <><span className="text-eco-leaf">Trouvez</span> des produits <span className="text-eco-leaf">éco-responsables</span></>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-eco-text/80 max-w-3xl mx-auto mb-12">
            {t('homepage.hero.subtitle')}
          </p>

          {/* Barre de recherche */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={currentQuery}
                onChange={handleInputChange}
                placeholder={t('common.searchPlaceholder') || 'Rechercher shampoing bio, jean éthique, miel local...'}
                className="w-full py-4 px-12 pr-16 border-2 border-eco-text/10 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-eco-leaf/30 focus:border-eco-leaf/50 transition-all text-eco-text placeholder-eco-text/50 bg-white/95 backdrop-blur"
                autoComplete="off"
              />
              
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-eco-text/50" />
              
              {isSearching && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-eco-leaf/30 border-t-eco-leaf rounded-full animate-spin"></div>
                </div>
              )}
              
              {currentQuery && !isSearching && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-eco-text/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-eco-text/50 hover:text-eco-text" />
                </button>
              )}
            </div>

            {/* Indicateurs de recherche */}
            {currentQuery && currentQuery.length >= 2 && (
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center gap-2 text-sm text-eco-leaf bg-eco-leaf/10 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-eco-leaf rounded-full animate-pulse"></div>
                  {t('common.searchingAlgolia') || 'Recherche en cours...'}
                </div>
              </div>
            )}
            
            {!hasSearched && currentQuery.length === 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={scrollToResults}
                  className="inline-flex items-center gap-2 text-eco-text/70 hover:text-eco-text transition-all group hover:scale-105"
                >
                  <span>{t('common.discoverProducts') || 'Découvrir nos produits'}</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </form>

          {hasSearched && !isSearching && searchStats.nbHits > 0 && (
            <div className="text-eco-text/60 text-sm">
              {searchStats.nbHits === 1 
                ? `1 résultat trouvé en ${searchStats.processingTimeMS}ms`
                : `${searchStats.nbHits} résultats trouvés en ${searchStats.processingTimeMS}ms`
              }
            </div>
          )}
        </div>
      </section>

      {/* RÉSULTATS */}
      <section id="results-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header résultats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-eco-text mb-2">
                {currentQuery ? `Résultats pour "${currentQuery}"` : 'Produits éco-responsables'}
              </h2>
              <p className="text-eco-text/70">
                {searchStats.nbHits === 1 ? 
                  `1 produit trouvé` :
                  `${searchStats.nbHits} produits trouvés`
                }
                {hasSearched ? ` correspondant à votre recherche` : ` disponibles`}
                {hasActiveFilters && (
                  <span className="text-eco-leaf"> ({searchStats.nbHits > 1 ? 'filtrés' : 'filtré'})</span>
                )}
                {totalPages > 1 && (
                  <span className="text-eco-text/50"> • Page {currentPage + 1} sur {totalPages}</span>
                )}
              </p>
            </div>

            {/* Boutons vue + filtre */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  hasActiveFilters 
                    ? 'border-eco-leaf bg-eco-leaf/10 text-eco-leaf' 
                    : 'border-eco-leaf/20 hover:bg-eco-leaf/10'
                }`}
              >
                <Filter className="h-4 w-4" />
                {t('common.filters') || 'Filtres'}
                {hasActiveFilters && (
                  <span className="bg-eco-leaf text-white text-xs px-1.5 py-0.5 rounded-full">
                    {[filters.ecoScore, filters.zone, filters.confidence].filter(Boolean).length}
                  </span>
                )}
              </button>
              <div className="flex border border-eco-leaf/20 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-eco-leaf text-white' : 'hover:bg-eco-leaf/10'}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-eco-leaf text-white' : 'hover:bg-eco-leaf/10'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          {isSearching && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-eco-leaf/30 border-t-eco-leaf rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-eco-text/60">{t('common.searchInProgress') || 'Recherche en cours...'}</p>
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
                    console.warn('Produit invalide ignoré:', product);
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
                    className="px-4 py-2 border border-eco-leaf/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-eco-leaf/10 transition-colors"
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
                              ? 'bg-eco-leaf text-white'
                              : 'border border-eco-leaf/20 hover:bg-eco-leaf/10'
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
                    className="px-4 py-2 border border-eco-leaf/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-eco-leaf/10 transition-colors"
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
              <Leaf className="h-16 w-16 text-eco-leaf/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-eco-text mb-2">
                Chargement des produits...
              </h3>
              <p className="text-eco-text/70">
                Veuillez patienter pendant le chargement des produits éco-responsables
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;