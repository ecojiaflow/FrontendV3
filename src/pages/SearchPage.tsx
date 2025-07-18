// PATH: frontend/ecolojiaFrontV3/src/pages/SearchPage.tsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  console.log('🔍 SearchPage chargée avec query:', query);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            🔍 Recherche Algolia
          </h1>
          <div className="w-32"></div> {/* Spacer */}
        </div>

        {/* Message de succès */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">
            Route /search réparée !
          </h2>
          
          {query && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <p className="text-blue-700 text-lg">
                Recherche détectée : <span className="font-bold text-blue-800 text-xl">"{query}"</span>
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-green-800 mb-4">✅ Routage fonctionnel !</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <ul className="space-y-2 text-green-700">
                <li>✅ Route /search ajoutée dans App.tsx</li>
                <li>✅ Paramètres URL récupérés correctement</li>
                <li>✅ Navigation entre pages opérationnelle</li>
                <li>✅ ErrorBoundary actif</li>
              </ul>
              <ul className="space-y-2 text-green-700">
                <li>🔗 Compatible avec structure existante</li>
                <li>🚀 Prêt pour React InstantSearch</li>
                <li>🔍 99 produits Algolia disponibles</li>
                <li>⚡ Performance optimisée</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tests de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-500" />
              Tests de recherche
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/search?q=bio')}
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                🔍 Rechercher "bio"
              </button>
              <button
                onClick={() => navigate('/search?q=nutella')}
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                🍫 Rechercher "nutella"
              </button>
              <button
                onClick={() => navigate('/search?q=yaourt')}
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                🥛 Rechercher "yaourt"
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-purple-500" />
              Navigation
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="block w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                🏠 Page d'accueil
              </button>
              <button
                onClick={() => navigate('/multi-categories')}
                className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                📋 Multi-catégories
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                ⚙️ Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Informations Algolia */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 Configuration Algolia</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Backend prêt ✅</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• App ID: A2KJGZ2811</li>
                  <li>• Search Key: 085aeee2b3ec8efa66dabb7691a01b67</li>
                  <li>• Index: ecolojia_products_staging</li>
                  <li>• Produits indexés: 99</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Prochaines étapes ⚡</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Installer react-instantsearch</li>
                  <li>• Créer composants de recherche</li>
                  <li>• Ajouter filtres avancés</li>
                  <li>• Intégrer analyse NOVA</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              <strong>🚀 Status :</strong> Route /search fonctionnelle ! Prêt pour l'implémentation React InstantSearch avec 99 produits Algolia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
// EOF