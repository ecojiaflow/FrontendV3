// PATH: frontend/src/pages/SearchPage.tsx
import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits, RefinementList, Pagination } from 'react-instantsearch-dom';
import ProductHit from '../components/ProductHit';

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY
);

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InstantSearch searchClient={searchClient} indexName="ecolojia_products_staging">
          {/* Barre de recherche */}
          <div className="mb-6">
            <SearchBox 
              translations={{ placeholder: '🔍 Rechercher un produit, une marque ou un ingrédient...' }} 
              className="w-full"
            />
          </div>

          {/* Filtres & Résultats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtres */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Catégories</h2>
                <RefinementList attribute="category" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Statut IA</h2>
                <RefinementList attribute="verified_status" />
              </div>
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              <Hits hitComponent={ProductHit} />
              <div className="mt-6">
                <Pagination />
              </div>
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
};

export default SearchPage;
// EOF
