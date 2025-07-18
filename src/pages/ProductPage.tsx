// PATH: frontend/ecolojiaFrontV3/src/pages/ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { analyzeProduct, reset } from '../services/ai/novaClassifier';
import NovaResults from '../components/NovaResults';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const [productName, setProductName] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'slug' | 'url' | 'manual'>('slug');

  useEffect(() => {
    console.log('🔍 ProductPage - Navigation détectée:', { 
      slug, 
      searchParams: Object.fromEntries(searchParams.entries()),
      pathname: location.pathname 
    });

    // ✅ PRIORITÉ 1: Paramètres URL depuis recherche Algolia
    const productNameParam = searchParams.get('productName');
    const ingredientsParam = searchParams.get('ingredients');
    
    if (productNameParam && ingredientsParam) {
      console.log('🔗 Analyse depuis URL params:', { productNameParam, ingredientsParam });
      setProductName(decodeURIComponent(productNameParam));
      setIngredients(decodeURIComponent(ingredientsParam));
      setAnalysisSource('url');
      
      // Lancer analyse automatiquement
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          const result = await analyzeProduct(
            decodeURIComponent(productNameParam), 
            decodeURIComponent(ingredientsParam)
          );
          setData(result);
        } catch (err: any) {
          setError(err.message || 'Erreur inconnue');
        } finally {
          setLoading(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }

    // ✅ PRIORITÉ 2: Slug prédéfini (exemples de démonstration)
    if (slug) {
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

      const product = productMap[slug];
      if (product) {
        console.log('📦 Analyse depuis slug:', { slug, product });
        setProductName(product.name);
        setIngredients(product.ingredients);
        setAnalysisSource('slug');
        
        const timer = setTimeout(async () => {
          try {
            setLoading(true);
            setError(null);
            const result = await analyzeProduct(product.name, product.ingredients);
            setData(result);
          } catch (err: any) {
            setError(err.message || 'Erreur inconnue');
          } finally {
            setLoading(false);
          }
        }, 500);
        return () => clearTimeout(timer);
      } else {
        console.warn('❌ Slug inconnu:', slug);
        navigate('/');
      }
    }

    // ✅ PRIORITÉ 3: Aucun paramètre - Interface manuelle
    if (!productNameParam && !ingredientsParam && !slug) {
      console.log('📝 Mode saisie manuelle');
      setAnalysisSource('manual');
    }

  }, [slug, searchParams, navigate, location.pathname, location.search]);

  const handleRetry = async () => {
    if (productName && ingredients) {
      try {
        setLoading(true);
        setError(null);
        const result = await analyzeProduct(productName, ingredients);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToSearch = () => {
    navigate('/search');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNewAnalysis = () => {
    reset();
    navigate('/analyze');
  };

  const handleManualAnalysis = async () => {
    if (!productName.trim() || !ingredients.trim()) {
      setError('Veuillez renseigner le nom du produit et les ingrédients');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await analyzeProduct(productName, ingredients);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Interface pour saisie manuelle
  if (analysisSource === 'manual' && !productName && !ingredients) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <span className="mr-2 text-lg">←</span>
                Retour à l'accueil
              </button>
              <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">
                Analyse NOVA Manuelle
              </h1>
              <button
                onClick={handleBackToSearch}
                className="text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                Recherche Algolia
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔬</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Analyse personnalisée
                </h2>
                <p className="text-gray-600">
                  Analysez n'importe quel produit avec notre IA NOVA
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Yaourt nature bio, Coca-Cola, Pain complet..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                    Liste des ingrédients *
                  </label>
                  <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Ex: Lait pasteurisé, ferments lactiques (Lactobacillus bulgaricus, Streptococcus thermophilus)..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Copiez la liste complète des ingrédients depuis l'étiquette du produit
                  </p>
                </div>

                <button
                  onClick={handleManualAnalysis}
                  disabled={!productName.trim() || !ingredients.trim() || loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Analyse en cours...' : '🔬 Analyser avec NOVA'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Conseils pour une analyse précise</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Nom complet :</strong> Incluez la marque et le type de produit</li>
                <li>• <strong>Ingrédients complets :</strong> Copiez exactement la liste depuis l'étiquette</li>
                <li>• <strong>Codes E :</strong> Incluez tous les additifs (E150d, E322, etc.)</li>
                <li>• <strong>Pourcentages :</strong> Conservez les % indiqués si présents</li>
              </ul>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // ✅ Interface d'analyse normale
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={analysisSource === 'url' ? handleBackToSearch : handleBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <span className="mr-2 text-lg">←</span>
              {analysisSource === 'url' ? 'Retour à la recherche' : 'Retour à l\'accueil'}
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

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{productName}</h2>
                <div className="space-y-3">
                  {slug && (
                    <div>
                      <span className="inline-block w-24 font-medium text-gray-700">Slug:</span>
                      <span className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {slug}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="inline-block w-24 font-medium text-gray-700">Source:</span>
                    <span className="text-gray-600 text-sm">
                      {analysisSource === 'url' ? '🔗 Recherche Algolia' : 
                       analysisSource === 'slug' ? '📦 Exemple prédéfini' : 
                       '📝 Saisie manuelle'}
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

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium mb-1">Erreur d'analyse</h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
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

          {loading && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
                <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Analyse IA en cours...</h3>
                <p className="text-gray-600 text-center">Classification NOVA automatique, détection d'additifs et génération de recommandations</p>
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

          {data && (
            <div className="transition-all duration-500 ease-in-out">
              <NovaResults result={data} loading={false} />
            </div>
          )}

          {!loading && !data && !error && productName && ingredients && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Prêt pour l'analyse NOVA</h3>
              <p className="text-gray-600 mb-6">L'analyse va démarrer automatiquement pour ce produit.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleManualAnalysis}
                  disabled={!productName || !ingredients}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Lancer l'analyse
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Nouvelle analyse
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Informations techniques</h3>
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
                <strong>🎯 Objectif :</strong> Cette page démontre l'intégration complète entre votre interface React et l'API ECOLOJIA pour l'analyse nutritionnelle en temps réel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProductPage;
// EOF