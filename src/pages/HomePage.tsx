import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Search, X, ChevronDown, Filter, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductHit from '../components/ProductHit';
import { fetchRealProducts } from '../api/realApi';
import { Product } from '../types';

// Composant NoResultsFound simple
const NoResultsFound: React.FC<{ query: string }> = ({ query }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-eco-text mb-2">
        Aucun produit trouvé pour "{query}"
      </h3>
      <p className="text-eco-text/70 mb-4">
        Essayez d'autres termes de recherche ou explorez nos catégories
      </p>
    </div>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États de base
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get('q'));
  const [searchStats, setSearchStats] = useState({ nbHits: 0, processingTimeMS: 0 });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const currentQuery = searchParams.get('q') || '';

  // Fonction de génération de slug simple
  const generateSlug = (product: Product): string => {
    if (product.slug && product.slug !== 'undefined') {
      return product.slug;
    }
    
    const title = product.nameKey || product.id;
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `product-${product.id}`;
  };

  // Chargement des produits
  const loadProducts = async (query = '') => {
    try {
      setIsSearching(true);
      const startTime = Date.now();
      
      console.log('🔄 Chargement produits avec query:', query);
      
      const results = await fetchRealProducts(query);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Produits chargés:', results.length);
      
      setAllResults(results);
      setSearchResults(results);
      setSearchStats({ 
        nbHits: results.length, 
        processingTimeMS: processingTime 
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      setAllResults([]);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Effet pour chargement initial
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setHasSearched(true);
      loadProducts(query);
    } else {
      setHasSearched(false);
      loadProducts();
    }
  }, [searchParams]);

  // Navigation fluide
  const scrollToResults = () => {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Gestion de la recherche
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      setTimeout(scrollToResults, 100);
    }
  };

  // 🎯 FONCTION CRITIQUE: Navigation vers produit
  const handleProductClick = (product: Product) => {
    console.log('🚀 HomePage - Clic produit détecté:', {
      id: product.id,
      nameKey: product.nameKey,
      slug: product.slug
    });
    
    const slug = generateSlug(product);
    console.log('🔧 HomePage - Slug généré:', slug);
    
    if (slug && slug !== 'undefined') {
      console.log('✅ HomePage - Navigation vers:', `/product/${slug}`);
      navigate(`/product/${slug}`);
    } else {
      console.error('❌ HomePage - Slug invalide:', slug);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Section Hero */}
      <section className="bg-eco-gradient py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Leaf className="h-16 w-16 text-eco-leaf animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-eco-text mb-6">
            <span className="text-eco-leaf">Trouvez</span> des produits <span className="text-eco-leaf">éco-responsables</span>
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
                placeholder="Rechercher shampoing bio, jean éthique, miel local..."
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
            
            {!hasSearched && currentQuery.length === 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={scrollToResults}
                  className="inline-flex items-center gap-2 text-eco-text/70 hover:text-eco-text transition-all group hover:scale-105"
                >
                  <span>Découvrir nos produits</span>
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
              </p>
            </div>

            {/* Boutons vue */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-eco-leaf/20 rounded-lg hover:bg-eco-leaf/10"
              >
                <Filter className="h-4 w-4" />
                Filtres
              </button>
              <div className="flex border border-eco-leaf/20 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-eco-leaf text-white' : 'hover:bg-eco-leaf/10'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-eco-leaf text-white' : 'hover:bg-eco-leaf/10'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          {isSearching && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-eco-leaf/30 border-t-eco-leaf rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-eco-text/60">Recherche en cours...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {searchResults.map((product, index) => {
                if (!product || !product.id) {
                  return null;
                }

                console.log('🎯 HomePage - Rendu produit:', {
                  index: index,
                  id: product.id,
                  nameKey: product.nameKey
                });

                return (
                  <div
                    key={`${product.id}-${index}`}
                    className="animate-fade-in-up"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <ProductHit 
                      hit={{
                        objectID: product.id,
                        id: product.id,
                        title: product.nameKey || 'Produit sans titre',
                        description: product.descriptionKey || '',
                        brand: product.brandKey || '',
                        category: product.category || '',
                        image_url: product.image || '',
                        eco_score: product.ethicalScore || 0,
                        slug: product.slug || generateSlug(product),
                        tags: product.tagsKeys || [],
                        zones_dispo: product.zonesDisponibles || [],
                        verified_status: product.verifiedStatus || 'manual_review',
                        ai_confidence: product.aiConfidence || 0,
                        confidence_pct: product.confidencePct || 0,
                        confidence_color: product.confidenceColor || 'yellow'
                      }}
                      viewMode={viewMode}
                      onClick={() => {
                        console.log('🚀 HomePage - ProductHit onClick déclenché pour:', product.id);
                        handleProductClick(product);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : hasSearched ? (
            <NoResultsFound query={currentQuery} />
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