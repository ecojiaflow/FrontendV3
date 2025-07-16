// PATH: frontend/src/pages/ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNovaApi } from '../hooks/useNovaApi';
import NovaResults from '../components/NovaResults';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

interface ProductPageProps {}

const ProductPage: React.FC<ProductPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [productName, setProductName] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>('');
  const { data, loading, error, analyzeProduct, retry, reset } = useNovaApi();

  useEffect(() => {
    // Mapping des slugs vers des produits de test
    const productMap: Record<string, { name: string; ingredients: string }> = {
      'pizza-surgelee-e621-glucose': {
        name: 'Pizza 4 Fromages Surgelée',
        ingredients: 'Pâte (farine de BLÉ, eau, huile de tournesol, levure, sel, sucre), fromages 25% (MOZZARELLA, EMMENTAL, GORGONZOLA, PARMESAN), sauce tomate, conservateur E202, exhausteur de goût E621, stabilisant E412, colorant E150d'
      },
      'coca-cola-original': {
        name: 'Coca-Cola Original',
        ingredients: 'Eau gazéifiée, sucre, sirop de glucose-fructose, arôme naturel de cola, colorant E150d (caramel IV), acidifiant E338 (acide phosphorique), édulcorant E952 (cyclamate de sodium), conservateur E211 (benzoate de sodium)'
      },
      'nutella-pate-tartiner': {
        name: 'Nutella Pâte à tartiner',
        ingredients: 'Sucre, huile de palme, NOISETTES 13%, cacao maigre 7.4%, LAIT écrémé en poudre 6.6%, LACTOSÉRUM en poudre, émulsifiants E322 (lécithines) E471 (mono- et diglycérides d\'acides gras), arôme vanilline'
      },
      'galette-riz-bio': {
        name: 'Galette de riz bio',
        ingredients: 'Riz complet biologique, sucre de canne, huile de tournesol, sel marin, arôme naturel'
      },
      'yaourt-nature-bio': {
        name: 'Yaourt Nature Bio',
        ingredients: 'LAIT entier pasteurisé issu de l\'agriculture biologique, ferments lactiques (Streptococcus thermophilus, Lactobacillus bulgaricus)'
      },
      'pain-mie-complet': {
        name: 'Pain de Mie Complet',
        ingredients: 'Farine complète de BLÉ, eau, levure, huile de tournesol, sucre, sel, gluten de BLÉ, conservateur E282, émulsifiant E471, agent de traitement de la farine E300'
      },
      'biscuits-petit-dejeuner': {
        name: 'Biscuits Petit-Déjeuner',
        ingredients: 'Céréales 58% (farine de BLÉ, flocons d\'AVOINE 14%), sucre, huile de palme, sirop de glucose-fructose, poudre à lever E500, sel, arômes, vitamines (B1, B6, B9, B12, C, E), colorant E160a, émulsifiant E322'
      }
    };

    if (slug) {
      const product = productMap[slug];
      if (product) {
        setProductName(product.name);
        setIngredients(product.ingredients);
        
        // Lancer automatiquement l'analyse après un court délai
        const timer = setTimeout(() => {
          analyzeProduct(product.name, product.ingredients);
        }, 500);

        return () => clearTimeout(timer);
      } else {
        console.error('❌ Produit non trouvé pour le slug:', slug);
        // Rediriger vers la page de démonstration si produit non trouvé
        navigate('/demo');
      }
    }
  }, [slug, analyzeProduct, navigate]);

  const handleRetry = async () => {
    if (productName && ingredients) {
      await retry();
    }
  };

  const handleBackToDemo = () => {
    reset();
    navigate('/demo');
  };

  const handleNewAnalysis = () => {
    reset();
    navigate('/results');
  };

  // Si pas de slug, rediriger
  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-md p-8">
          <div className="text-6xl mb-4">❓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Produit non spécifié</h2>
          <p className="text-gray-600 mb-6">
            Aucun produit n'a été spécifié pour l'analyse.
          </p>
          <button 
            onClick={handleBackToDemo}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour à la démo
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header avec navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToDemo}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <span className="mr-2 text-lg">←</span>
              Retour à la démo
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
              Analyse NOVA
            </h1>
            
            <button
              onClick={handleNewAnalysis}
              className="text-green-600 hover:text-green-800 font-medium transition-colors"
            >
              Nouvelle analyse
            </button>
          </div>

          {/* Informations produit */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{productName}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="inline-block w-24 font-medium text-gray-700">Slug:</span>
                    <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {slug}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block w-24 font-medium text-gray-700 align-top">Ingrédients:</span>
                    <span className="text-gray-600 text-sm leading-relaxed inline-block max-w-2xl">
                      {ingredients}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status de l'analyse */}
              <div className="ml-6 text-right">
                {loading && (
                  <div className="flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm font-medium">Analyse...</span>
                  </div>
                )}
                
                {data && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    <span className="text-sm font-medium">Analysé</span>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center text-red-600">
                    <span className="mr-2">❌</span>
                    <span className="text-sm font-medium">Erreur</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Gestion des erreurs */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium mb-1">Erreur d'analyse</h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    
                    {/* Suggestions d'amélioration */}
                    <div className="text-sm">
                      <p className="text-red-800 font-medium mb-2">💡 Suggestions:</p>
                      <ul className="text-red-700 list-disc list-inside space-y-1">
                        <li>Vérifiez votre connexion internet</li>
                        <li>Réessayez dans quelques secondes</li>
                        <li>Testez avec un autre produit</li>
                        {error.includes('quota') && <li>Attendez le renouvellement du quota</li>}
                        {error.includes('confidence') && <li>Ajoutez plus d'informations sur le produit</li>}
                      </ul>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleRetry}
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* État de chargement */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
                <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">
                  Analyse IA en cours...
                </h3>
                <p className="text-gray-600 text-center">
                  Classification NOVA automatique, détection d'additifs et génération de recommandations
                </p>
                
                <div className="mt-6 w-full max-w-md">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Analyse des ingrédients</span>
                    <span>Classification NOVA</span>
                    <span>Recommandations</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Résultats de l'analyse */}
          {data && (
            <div className="transition-all duration-500 ease-in-out">
              <NovaResults result={data} loading={false} />
            </div>
          )}

          {/* État initial sans données */}
          {!loading && !data && !error && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Prêt pour l'analyse NOVA
              </h3>
              <p className="text-gray-600 mb-6">
                L'analyse va démarrer automatiquement pour ce produit.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => analyzeProduct(productName, ingredients)}
                  disabled={!productName || !ingredients}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Lancer l'analyse
                </button>
                
                <button
                  onClick={handleBackToDemo}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Choisir un autre produit
                </button>
              </div>
            </div>
          )}

          {/* Informations techniques en bas */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🛠️ Informations techniques
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">API Backend</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• URL: <code className="bg-gray-100 px-1 rounded">ecolojia-backend-working.onrender.com</code></li>
                  <li>• Endpoint: <code className="bg-gray-100 px-1 rounded">/api/analyze/auto</code></li>
                  <li>• Méthode: POST</li>
                  <li>• Format: JSON</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Technologies IA</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Classification NOVA automatique</li>
                  <li>• Détection type produit (alimentaire/cosmétique/ménager)</li>
                  <li>• Analyse additifs avec évaluation risques</li>
                  <li>• Génération recommandations personnalisées</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>🎯 Objectif:</strong> Cette page démontre l'intégration complète entre votre interface React 
                et l'API ECOLOJIA pour l'analyse nutritionnelle en temps réel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProductPage;