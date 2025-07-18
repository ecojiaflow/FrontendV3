// PATH: src/pages/ProductPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { analyzeProduct, reset } from '../services/ai/novaClassifier';
import NovaResults from '../components/NovaResults';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * ProductPage (version corrigée)
 * - Suppression du bloc JSX dupliqué après export (qui cassait le build)
 * - Gestion anti-race pour éviter état 'error' résiduel après succès
 * - Le bloc d'erreur n'apparaît pas si des données valides existent
 */

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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Anti race-condition: identifiant incrémental pour chaque analyse lancée
  const runIdRef = useRef(0);

  useEffect(() => {
    setError(null);
    setData(null);

    const productNameParam = searchParams.get('productName');
    const ingredientsParam = searchParams.get('ingredients');

    // 1. Paramètres URL (recherche Algolia)
    if (productNameParam && ingredientsParam) {
      const decodedName = decodeURIComponent(productNameParam);
      const decodedIngredients = decodeURIComponent(ingredientsParam);
      setProductName(decodedName);
      setIngredients(decodedIngredients);
      setAnalysisSource('url');
      setDebugInfo({ source: 'url_params', productNameParam, ingredientsParam });
      const t = setTimeout(() => performAnalysis(decodedName, decodedIngredients, 'url_params'), 300);
      return () => clearTimeout(t);
    }

    // 2. Slug prédéfini
    if (slug) {
      const productMap: Record<string, { name: string; ingredients: string }> = {
        'pizza-surgelee-e621-glucose': {
          name: 'Pizza 4 Fromages Surgelée',
          ingredients:
            'Pâte (farine de BLÉ, eau, huile de tournesol, levure, sel, sucre), fromages 25% (MOZZARELLA, EMMENTAL, GORGONZOLA, PARMESAN), sauce tomate, conservateur E202, exhausteur de goût E621, stabilisant E412, colorant E150d'
        },
        'coca-cola-original': {
          name: 'Coca-Cola Original',
          ingredients:
            'Eau gazéifiée, sucre, sirop de glucose-fructose, arôme naturel de cola, colorant E150d (caramel IV), acidifiant E338 (acide phosphorique), édulcorant E952 (cyclamate de sodium), conservateur E211 (benzoate de sodium)'
        },
        'nutella-pate-tartiner': {
          name: 'Nutella Pâte à tartiner',
          ingredients:
            'Sucre, huile de palme, NOISETTES 13%, cacao maigre 7.4%, LAIT écrémé en poudre 6.6%, LACTOSÉRUM en poudre, émulsifiants E322 (lécithines) E471 (mono- et diglycérides d\'acides gras), arôme vanilline'
        },
        'galette-riz-bio': {
          name: 'Galette de riz bio',
          ingredients: 'Riz complet biologique, sucre de canne, huile de tournesol, sel marin, arôme naturel'
        },
        'yaourt-nature-bio': {
          name: 'Yaourt Nature Bio',
          ingredients:
            'LAIT entier pasteurisé issu de l\'agriculture biologique, ferments lactiques (Streptococcus thermophilus, Lactobacillus bulgaricus)'
        },
        'pain-mie-complet': {
          name: 'Pain de Mie Complet',
          ingredients:
            'Farine complète de BLÉ, eau, levure, huile de tournesol, sucre, sel, gluten de BLÉ, conservateur E282, émulsifiant E471, agent de traitement de la farine E300'
        },
        'biscuits-petit-dejeuner': {
          name: 'Biscuits Petit-Déjeuner',
          ingredients:
            'Céréales 58% (farine de BLÉ, flocons d\'AVOINE 14%), sucre, huile de palme, sirop de glucose-fructose, poudre à lever E500, sel, arômes, vitamines (B1, B6, B9, B12, C, E), colorant E160a, émulsifiant E322'
        }
      };

      const product = productMap[slug];
      if (product) {
        setProductName(product.name);
        setIngredients(product.ingredients);
        setAnalysisSource('slug');
        setDebugInfo({ source: 'predefined_slug', slug });
        const t = setTimeout(
          () => performAnalysis(product.name, product.ingredients, 'predefined_slug'),
          300
        );
        return () => clearTimeout(t);
      } else {
        setError(`Slug "${slug}" non reconnu`);
        setDebugInfo({ source: 'unknown_slug', slug });
      }
    }

    // 3. Saisie manuelle
    if (!productNameParam && !ingredientsParam && !slug) {
      setAnalysisSource('manual');
      setDebugInfo({ source: 'manual_input' });
    }
  }, [slug, searchParams, location.pathname, location.search]);

  const performAnalysis = async (name: string, ingr: string, source: string) => {
    if (!name.trim() || !ingr.trim()) {
      setError('Le nom du produit et les ingrédients sont requis');
      return;
    }
    const runId = ++runIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const result = await analyzeProduct(name.trim(), ingr.trim());
      if (runId !== runIdRef.current) return; // réponse obsolète ignorée

      if (!result || typeof result !== 'object') throw new Error("Résultat d'analyse invalide");
      if (typeof result.novaGroup !== 'number' || result.novaGroup < 1 || result.novaGroup > 4)
        result.novaGroup = 4;
      if (typeof result.healthScore !== 'number' || result.healthScore < 0 || result.healthScore > 100)
        result.healthScore = 50;

      setData(result);
      setError(null); // on efface toute erreur précédente
      setDebugInfo((p: any) => ({
        ...p,
        lastSource: source,
        analysisSuccess: true,
        novaGroup: result.novaGroup,
        healthScore: result.healthScore,
        additivesCount: result.additives?.total || 0
      }));
    } catch (e: any) {
      if (runId !== runIdRef.current) return;
      const msg = e?.message || "Impossible d'analyser ce produit";
      setError(msg);

      if (/impossible|critique/i.test(msg)) {
        // fallback local
        const fb = generateFallbackAnalysis(name, ingr);
        setData(fb);
        setError(null); // on cache l'erreur si fallback ok
      }

      setDebugInfo((p: any) => ({ ...p, analysisError: true, errorMessage: msg }));
    } finally {
      if (runId === runIdRef.current) setLoading(false);
    }
  };

  const generateFallbackAnalysis = (name: string, ingr: string) => {
    const lower = ingr.toLowerCase();
    let nova = 1;
    if (/e1|e2|e3|e4|e5/.test(lower)) nova = 4;
    else if (/sucre|huile|sel/.test(lower)) nova = 3;
    else if (/farine|beurre/.test(lower)) nova = 2;
    const score = nova === 1 ? 90 : nova === 2 ? 70 : nova === 3 ? 50 : 25;
    return {
      productName: name,
      novaGroup: nova,
      healthScore: score,
      confidence: 60,
      reasoning: `Analyse de base (NOVA ${nova}) via mots-clés.`,
      additives: { detected: [], total: 0 },
      recommendations: [
        `Produit classé NOVA ${nova}`,
        nova >= 3 ? 'Consommation modérée' : 'Bon choix nutritionnel',
        'Analyse complète indisponible (fallback)'
      ],
      category: 'alimentaire',
      timestamp: new Date().toISOString()
    };
  };

  // Handlers
  const handleRetry = () => performAnalysis(productName, ingredients, 'retry');
  const handleBackToSearch = () => navigate('/search');
  const handleBackToHome = () => navigate('/');
  const handleNewAnalysis = () => {
    reset();
    navigate('/analyze');
  };
  const handleManualAnalysis = () => performAnalysis(productName, ingredients, 'manual');
  const handleGoToChat = () => {
    if (data)
      navigate('/chat', {
        state: { context: data, initialMessage: `Parle-moi de "${data.productName}"` }
      });
    else navigate('/chat');
  };

  // Mode saisie manuelle initiale
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
                <span className="mr-2 text-lg">←</span>Retour à l'accueil
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyse personnalisée</h2>
                <p className="text-gray-600">
                  Analysez n'importe quel produit avec notre IA NOVA avancée
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Yaourt nature bio, Coca-Cola..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Liste des ingrédients *
                  </label>
                  <textarea
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Ex: Lait, ferments lactiques (Streptococcus thermophilus, ...)"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Copiez la liste complète des ingrédients depuis l'étiquette.
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
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                💡 Conseils pour une analyse précise
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Nom complet :</strong> marque + type</li>
                <li>• <strong>Ingrédients complets :</strong> recopiez l'étiquette</li>
                <li>• <strong>Codes E :</strong> incluez tous les additifs (E150d, E322, ...)</li>
                <li>• <strong>Pourcentages :</strong> gardez les % indiqués</li>
              </ul>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Interface d'analyse
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
            <h1 className="text-2xl font-bold text-gray-800 text-center flex-1">Analyse NOVA</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleGoToChat}
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                💬 Chat IA
              </button>
              <button
                onClick={handleNewAnalysis}
                className="text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                Nouvelle analyse
              </button>
            </div>
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
                      {analysisSource === 'url'
                        ? '🔗 Recherche Algolia'
                        : analysisSource === 'slug'
                        ? '📦 Exemple prédéfini'
                        : '📝 Saisie manuelle'}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block w-24 font-medium text-gray-700 align-top">
                      Ingrédients:
                    </span>
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
                {data && !error && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    <span className="text-sm font-medium">Analysé</span>
                  </div>
                )}
                {error && !data && (
                  <div className="flex items-center text-red-600">
                    <span className="mr-2">❌</span>
                    <span className="text-sm font-medium">Erreur</span>
                  </div>
                )}
              </div>
            </div>

            {error && !data && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium mb-1">Erreur d'analyse</h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>

                    <div className="text-sm">
                      <p className="text-red-800 font-medium mb-2">💡 Solutions suggérées:</p>
                      <ul className="text-red-700 list-disc list-inside space-y-1">
                        {error.includes('requis') && <li>Vérifiez le nom et les ingrédients</li>}
                        <li>Réessayez dans quelques secondes</li>
                        <li>Testez un autre produit (Nutella, Yaourt bio)</li>
                        <li>Utilisez un exemple prédéfini</li>
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={handleRetry}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        🔄 Réessayer
                      </button>
                      <button
                        onClick={() => navigate('/product/nutella-pate-tartiner')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        🧪 Tester Nutella
                      </button>
                      <button
                        onClick={() => navigate('/product/yaourt-nature-bio')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        🥛 Tester Yaourt Bio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex flex-col items-center justify-center">
                <LoadingSpinner />
                <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">
                  Analyse IA en cours...
                </h3>
                <p className="text-gray-600 text-center">
                  Classification NOVA, détection d'additifs, recommandations...
                </p>
              </div>
            </div>
          )}

            {data && !error && (
            <div className="transition-all duration-500 ease-in-out">
              <NovaResults result={data} loading={false} />

              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Que faire maintenant ?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleGoToChat}
                    className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    💬 Discuter de ce produit
                  </button>
                  <button
                    onClick={() => navigate('/search')}
                    className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    🔍 Chercher des alternatives
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    🔬 Analyser un autre produit
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !data && !error && productName && ingredients && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Prêt pour l'analyse NOVA</h3>
              <p className="text-gray-600 mb-6">
                L'analyse va démarrer automatiquement pour ce produit.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleManualAnalysis}
                  disabled={!productName || !ingredients}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  🚀 Lancer l'analyse maintenant
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  📝 Nouvelle analyse
                </button>
              </div>
            </div>
          )}

          {debugInfo && process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Debug</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Source: {debugInfo.source}</li>
                {debugInfo.lastSource && <li>• Dernière analyse: {debugInfo.lastSource}</li>}
                <li>• URL: {location.pathname + location.search}</li>
                {debugInfo.novaGroup && (
                  <li>• Résultat: NOVA {debugInfo.novaGroup}, Score {debugInfo.healthScore}</li>
                )}
                {debugInfo.errorMessage && <li>• Erreur: {debugInfo.errorMessage}</li>}
              </ul>
            </div>
          )}

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🛠️ Informations techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Mode Analyse</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Mode: Production locale avancée</li>
                  <li>• Backend: Désactivé</li>
                  <li>• Fallback: IA locale</li>
                  <li>• Base additifs: 25+ additifs</li>
                  <li>• Confiance: 88-92% estimée</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Technologies IA</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Classification NOVA avancée</li>
                  <li>• Détection type produit</li>
                  <li>• Analyse additifs + risques</li>
                  <li>• Score santé multi-facteurs</li>
                  <li>• Recommandations contextuelles</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <strong>🎯 Objectif :</strong> démonstration d'une analyse NOVA complète sans backend distant.
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProductPage;
// EOF (version corrigée)
