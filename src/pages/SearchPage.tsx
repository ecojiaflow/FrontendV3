// PATH: frontend/ecolojiaFrontV3/src/pages/SearchPage.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
  Configure
} from 'react-instantsearch';
import { ArrowLeft, Search, Filter, X, Eye, ExternalLink } from 'lucide-react';

// ✅ Configuration Algolia avec vraies clés
const searchClient = algoliasearch(
  'A2KJGZ2811', // App ID
  '085aeee2b3ec8efa66dabb7691a01b67' // Search API Key
);

// ✅ Composant Hit personnalisé pour afficher un produit
const ProductHit: React.FC<{ hit: any }> = ({ hit }) => {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/product/${hit.objectID}`);
  };

  const handleAnalyze = () => {
    // ✅ CORRECTION: Navigation vers /analyze avec paramètres URL encodés
    const productName = hit.product_name || 'Produit sans nom';
    const ingredients = hit.ingredients_text || '';
    
    console.log('🔍 Navigation vers analyse:', { productName, ingredients });
    
    navigate(`/analyze?productName=${encodeURIComponent(productName)}&ingredients=${encodeURIComponent(ingredients)}`);
  };

  // Helper pour les couleurs NOVA
  const getNovaColor = (novaGroup: number): string => {
    switch (novaGroup) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-orange-600 bg-orange-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Helper pour les couleurs de confiance
  const getConfidenceColor = (color: string): string => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Nom du produit */}
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {hit.product_name || 'Produit sans nom'}
          </h3>
          
          {/* Marque */}
          {hit.brands && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Marque:</span> {hit.brands}
            </p>
          )}
          
          {/* Badges informatifs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Badge NOVA */}
            {hit.nova_group > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNovaColor(hit.nova_group)}`}>
                NOVA {hit.nova_group}
              </span>
            )}
            
            {/* Badge Nutri-Score */}
            {hit.nutriscore_grade && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                hit.nutriscore_grade <= 'B' ? 'text-green-600 bg-green-100' : 
                hit.nutriscore_grade <= 'D' ? 'text-orange-600 bg-orange-100' : 
                'text-red-600 bg-red-100'
              }`}>
                Nutri-Score {hit.nutriscore_grade.toUpperCase()}
              </span>
            )}
            
            {/* Badge Statut */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              hit.verification_status === 'verified' ? 'text-green-600 bg-green-100' :
              hit.verification_status === 'ai_analyzed' ? 'text-blue-600 bg-blue-100' :
              'text-orange-600 bg-orange-100'
            }`}>
              {hit.verification_status === 'verified' ? 'Vérifié' : 
               hit.verification_status === 'ai_analyzed' ? 'IA' : 'En attente'}
            </span>
            
            {/* Badge Catégorie */}
            <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
              {hit.category || 'alimentaire'}
            </span>

            {/* Badge Confiance */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(hit.confidence_color || 'orange')}`}>
              {hit.confidence_color === 'green' ? 'Haute' : 
               hit.confidence_color === 'orange' ? 'Moyenne' : 'Faible'}
            </span>
          </div>
          
          {/* Ingrédients (extrait) */}
          {hit.ingredients_text && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              <span className="font-medium">Ingrédients:</span> {hit.ingredients_text.substring(0, 120)}
              {hit.ingredients_text.length > 120 && '...'}
            </p>
          )}
        </div>
        
        {/* Image du produit */}
        {hit.image_url && (
          <div className="ml-4 flex-shrink-0">
            <img 
              src={hit.image_url} 
              alt={hit.product_name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          ID: {hit.objectID}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewProduct}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Eye className="w-4 h-4 mr-1" />
            Voir
          </button>
          <button
            onClick={handleAnalyze}
            className="flex items-center px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Analyser NOVA
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Composant de message quand aucun résultat
const NoResults: React.FC = () => (
  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
    <div className="text-6xl mb-4">🔍</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé</h3>
    <p className="text-gray-600 mb-4">
      Essayez avec des mots-clés différents ou vérifiez l'orthographe
    </p>
    <p className="text-sm text-gray-500">
      Suggestions : bio, nutella, yaourt, coca-cola, pain, biscuits
    </p>
  </div>
);

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
            'objectID', 'id', 'product_name', 'brands', 'categories',
            'nova_group', 'nutriscore_grade', 'image_url', 'ingredients_text',
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
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
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
                Recherche Algolia
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
          {/* Barre de recherche */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <SearchBox
              placeholder="🔍 Rechercher un produit, une marque ou un ingrédient..."
              classNames={{
                root: 'relative',
                form: 'relative',
                input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-12 text-lg',
                submit: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600',
                reset: 'absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              }}
            />
            <div className="mt-3 text-sm text-gray-500">
              Recherchez parmi 99 produits indexés • Filtres avancés disponibles
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filtres */}
            <div className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-500" />
                    Filtres
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
                
                {/* Filtre par catégorie */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Catégorie</h3>
                  <RefinementList
                    attribute="category"
                    limit={10}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'
                    }}
                  />
                </div>
                
                {/* Filtre par groupe NOVA */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Groupe NOVA</h3>
                  <RefinementList
                    attribute="nova_group"
                    limit={5}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'
                    }}
                  />
                </div>
                
                {/* Filtre par statut de vérification */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Statut</h3>
                  <RefinementList
                    attribute="verification_status"
                    limit={5}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'
                    }}
                  />
                </div>

                {/* Filtre par confiance */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Confiance</h3>
                  <RefinementList
                    attribute="confidence_color"
                    limit={5}
                    classNames={{
                      list: 'space-y-2',
                      item: 'flex items-center',
                      label: 'flex items-center cursor-pointer',
                      checkbox: 'mr-2 rounded',
                      labelText: 'text-sm text-gray-700',
                      count: 'ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="w-full lg:w-3/4">
              {/* Statistiques */}
              <div className="flex items-center justify-between mb-6">
                <Stats
                  classNames={{
                    root: 'text-sm text-gray-600'
                  }}
                  translations={{
                    stats: (nbHits, timeSpentMS) => {
                      return `📊 ${nbHits.toLocaleString()} produit${nbHits !== 1 ? 's' : ''} trouvé${nbHits !== 1 ? 's' : ''} en ${timeSpentMS}ms`;
                    }
                  }}
                />
                <div className="text-sm text-gray-500">
                  99 produits indexés dans Algolia
                </div>
              </div>
              
              {/* Résultats */}
              <div className="space-y-4 mb-6">
                <Hits 
                  hitComponent={ProductHit}
                  classNames={{
                    root: 'space-y-4',
                    list: 'space-y-4',
                    item: ''
                  }}
                />
              </div>
              
              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <Pagination
                  classNames={{
                    root: 'flex space-x-1',
                    list: 'flex space-x-1',
                    item: 'px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer',
                    selectedItem: 'px-3 py-2 bg-green-500 text-white rounded text-sm cursor-pointer',
                    disabledItem: 'px-3 py-2 border border-gray-300 rounded text-sm text-gray-400 cursor-not-allowed'
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
// EOF