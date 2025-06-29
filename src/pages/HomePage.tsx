// src/pages/HomePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search, X, ChevronDown, Filter, Grid, List, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductHit from '../components/ProductHit';
import NoResultsFound from '../components/NoResultsFound';
import searchClient, { ALGOLIA_INDEX_NAME } from '../lib/algolia';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [originalResults, setOriginalResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStats, setSearchStats] = useState({ nbHits: 0, processingTimeMS: 0 });

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hitsPerPage] = useState(12);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ ecoScore: '', zone: '', confidence: '' });

  useEffect(() => { loadInitialProducts(); }, []);

  const loadInitialProducts = async () => {
    try {
      setIsSearching(true);
      const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);
      const results = await index.search('', { hitsPerPage, page: 0 });
      setSearchResults(results.hits);
      setOriginalResults(results.hits);
      setTotalPages(results.nbPages);
      setSearchStats({ nbHits: results.nbHits, processingTimeMS: results.processingTimeMS });
    } catch (err) {
      console.error('Erreur chargement initial:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const performSearch = useCallback(
    async (searchQuery: string, page = 0) => {
      if (!searchQuery.length) {
        loadInitialProducts();
        setHasSearched(false);
        setCurrentPage(0);
        return;
      }
      if (searchQuery.length < 2) return;

      try {
        setIsSearching(true);
        const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);
        const results = await index.search(searchQuery, {
          hitsPerPage,
          page,
          highlightPreTag: '<mark class="bg-eco-leaf/20 text-eco-text">',
          highlightPostTag: '</mark>',
        });
        setSearchResults(results.hits);
        setOriginalResults(results.hits);
        setTotalPages(results.nbPages);
        setCurrentPage(page);
        setSearchStats({ nbHits: results.nbHits, processingTimeMS: results.processingTimeMS });
        setHasSearched(true);
      } catch (err) {
        console.error('Erreur recherche:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [hitsPerPage],
  );

  useEffect(() => {
    const id = setTimeout(() => performSearch(query, 0), 300);
    return () => clearTimeout(id);
  }, [query, performSearch]);

  const scrollToResults = () => {
    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);
  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    setCurrentPage(0);
    setFilters({ ecoScore: '', zone: '', confidence: '' });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) scrollToResults();
  };
  const handlePageChange = (p: number) => {
    performSearch(query, p);
    scrollToResults();
  };

  const handleProductClick = (hit: any) => navigate(`/product/${hit.slug || hit.objectID}`);

  const applyFilters = () => {
    let filtered = [...originalResults];
    if (filters.ecoScore) filtered = filtered.filter(h => h.eco_score >= parseFloat(filters.ecoScore));
    if (filters.zone) filtered = filtered.filter(h => h.zones_dispo?.includes(filters.zone));
    if (filters.confidence) filtered = filtered.filter(h => h.ai_confidence >= parseFloat(filters.confidence));
    setSearchResults(filtered);
    setSearchStats({ ...searchStats, nbHits: filtered.length });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({ ecoScore: '', zone: '', confidence: '' });
    setSearchResults(originalResults);
    setSearchStats({ ...searchStats, nbHits: originalResults.length });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-eco-leaf/10 via-white to-eco-secondary/5 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-eco-leaf/10 rounded-full">
              <Leaf className="w-12 h-12 text-eco-leaf" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-eco-text mb-4">
            {t('home.heroTitle', 'Découvrez les produits écoresponsables')}
          </h1>
          
          <p className="text-xl text-eco-text/70 mb-8 leading-relaxed">
            {t('home.heroSubtitle', 'Trouvez facilement des alternatives durables grâce à notre intelligence artificielle')}
          </p>

          {/* BARRE DE RECHERCHE */}
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-eco-text/60 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={t('common.searchPlaceholder', 'Rechercher des produits écoresponsables...')}
                className="w-full pl-12 pr-12 py-4 text-lg border-2 border-eco-leaf/20 rounded-full focus:outline-none focus:border-eco-leaf bg-white shadow-lg"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-eco-text/60 hover:text-eco-leaf"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-eco-text/60">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>{t('home.feature1', 'Recherche intelligente')}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{t('home.feature2', 'Scores écologiques')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{t('home.feature3', 'Produits vérifiés')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* RÉSULTATS */}
      <section id="results-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats et contrôles */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              {searchStats.nbHits > 0
                ? `${searchStats.nbHits} produits trouvés en ${searchStats.processingTimeMS}ms`
                : 'Aucun résultat'}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-eco-leaf text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-eco-leaf text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isSearching ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-eco-leaf/30 border-t-eco-leaf rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-eco-text/60">{t('common.searchInProgress')}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {searchResults.map((hit, index) => (
                <div
                  key={hit.objectID || index}
                  onClick={() => handleProductClick(hit)}
                  className="cursor-pointer animate-fade-in-up"
                >
                  <ProductHit hit={hit} />
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <NoResultsFound query={query} onEnrichRequest={() => {}} />
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default HomePage;