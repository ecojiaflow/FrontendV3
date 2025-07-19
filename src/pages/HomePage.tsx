// PATH: frontend/ecolojiaFrontV3/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search, X, MessageCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarcodeScanner from '../components/scanner/BarcodeScanner';
// ✅ NOUVEAU: Import Analytics Widget  
import QuickStatsWidget from '../components/analysis/QuickStatsWidget';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  /* ---------- Détection mobile ---------- */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ---------- Recherche texte ---------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      /* ✅ redirection correcte vers la page de recherche Algolia */
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClear = () => setSearchQuery('');

  /* ---------- Scanner mobile ---------- */
  const handleScanSuccess = (barcode: string) => {
    console.log('📱 Code-barres scanné :', barcode);
    setShowScanner(false);
    const params = new URLSearchParams({ barcode, method: 'scan' });
    /* ✅ template string + params */
    navigate(`/results?${params.toString()}`);
  };

  const handleCloseScanner = () => setShowScanner(false);
  const openScanner = () => setShowScanner(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HERO ===== */}
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

          {/* Bouton scanner (mobile) */}
          {isMobile && (
            <div className="mb-8">
              <button
                onClick={openScanner}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 w-full max-w-sm mx-auto flex items-center justify-center space-x-2"
              >
                <span className="text-xl">📷</span>
                <span>Scanner un produit</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">📱 Scannez directement avec votre caméra</p>
            </div>
          )}

          {/* Barre de recherche */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher shampoing bio, jean éthique, miel local..."
                className="w-full py-4 px-12 pr-16 border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 placeholder-gray-500 bg-white"
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
              >
                Rechercher des produits
              </button>
            </div>
          </form>

          <div className="text-gray-500 text-sm">
            Essayez la démonstration pour voir notre IA en action !
          </div>
        </div>
      </section>

      {/* ===== FONCTIONNALITÉS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Intelligence Artificielle NOVA
            </h2>
            <p className="text-xl text-gray-600">
              Analysez vos produits avec notre IA révolutionnaire
            </p>
          </div>

          {/* Cartes des fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Classification NOVA</h3>
              <p className="text-gray-600">
                Analyse automatique selon la classification scientifique NOVA (groupes 1-4)
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">⚗️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Détection d'additifs</h3>
              <p className="text-gray-600">
                Identification des additifs alimentaires avec évaluation des risques
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-100">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Recommandations</h3>
              <p className="text-gray-600">
                Conseils personnalisés et alternatives naturelles suggérées
              </p>
            </div>
          </div>

          {/* Exemples d'analyses */}
          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Exemples d'analyses NOVA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/product/coca-cola-original"
                className="block bg-white border border-red-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">Coca-Cola Original</span>
                    <div className="text-sm text-gray-500">🥤 Boisson</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Groupe NOVA 4 – Ultra-transformé avec additifs E150d, E952, E211
                </p>
              </Link>

              <Link
                to="/product/nutella-pate-tartiner"
                className="block bg-white border border-red-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">Nutella</span>
                    <div className="text-sm text-gray-500">🍫 Pâte à tartiner</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Groupe NOVA 4 – Huile de palme, émulsifiants E322, E471
                </p>
              </Link>

              <Link
                to="/product/yaourt-nature-bio"
                className="block bg-white border border-green-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">Yaourt Bio</span>
                    <div className="text-sm text-gray-500">🥛 Produit laitier</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Groupe NOVA 1 – Aliment non transformé, ferments naturels
                </p>
              </Link>
            </div>
          </div>

          {/* Call-to-action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Prêt à analyser vos produits ?
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/search"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                🔍 Rechercher des produits
              </Link>
              <Link
                to="/product"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📊 Analyser un produit
              </Link>
              <Link
                to="/chat"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                💬 Assistant Nutritionnel
              </Link>
              {!isMobile && (
                <Link
                  to="/scan"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  📱 Scanner mobile
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== NOUVEAU: SECTION DASHBOARD PERSONNEL ===== */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              📊 Suivez Vos Progrès Santé
            </h2>
            <p className="text-xl text-gray-600">
              Votre coach personnel nutrition avec analytics avancées
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Widget Statistics */}
            <div>
              <QuickStatsWidget />
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Tableau de bord intelligent
              </h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">📈</span>
                  <div>
                    <strong>Suivi évolution</strong> de votre score santé au fil du temps
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">🎯</span>
                  <div>
                    <strong>Objectifs personnalisés</strong> pour améliorer votre alimentation
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">🤖</span>
                  <div>
                    <strong>Insights IA</strong> et recommandations adaptées à vos habitudes
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">🏆</span>
                  <div>
                    <strong>Système d'achievements</strong> pour vous motiver
                  </div>
                </li>
              </ul>
              
              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  🚀 Voir mon Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Fonctionnalités Dashboard */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-purple-200">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-bold text-gray-800 mb-2">Score Santé</h4>
              <p className="text-sm text-gray-600">Suivi en temps réel de votre score global ECOLOJIA</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-purple-200">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="font-bold text-gray-800 mb-2">Évolution</h4>
              <p className="text-sm text-gray-600">Graphiques d'amélioration de vos habitudes alimentaires</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-purple-200">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-bold text-gray-800 mb-2">Objectifs</h4>
              <p className="text-sm text-gray-600">Goals personnalisés avec tracking de progression</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-purple-200">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-bold text-gray-800 mb-2">Achievements</h4>
              <p className="text-sm text-gray-600">Débloquez des badges selon vos progrès</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ASSISTANT IA NUTRITIONNEL ===== */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              💬 Assistant IA Nutritionnel
            </h2>
            <p className="text-xl text-gray-600">
              Posez vos questions à notre expert en nutrition
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Votre expert personnel en nutrition
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong>Conseils personnalisés</strong> basés sur vos analyses NOVA
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong>Explications détaillées</strong> sur les additifs alimentaires
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong>Recommandations</strong> d'alternatives plus saines
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <div>
                      <strong>Réponses instantanées</strong> 24h/24 basées sur la science
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6 shadow-md mb-6">
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 italic text-sm">
                      "Bonjour ! Je suis votre assistant nutritionnel ECOLOJIA. 
                      Je peux vous aider à comprendre les analyses NOVA, 
                      décoder les additifs et vous donner des conseils 
                      pour une alimentation plus saine !"
                    </p>
                  </div>
                </div>
                
                <Link
                  to="/chat"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Démarrer une conversation
                </Link>
              </div>
            </div>
          </div>

          {/* Questions fréquentes */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              💡 Questions fréquentes que vous pouvez poser :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Ce produit est-il bon pour la santé ?",
                "Quels sont les additifs préoccupants ?",
                "Comment améliorer mon alimentation ?",
                "Que signifie le groupe NOVA 4 ?",
                "Existe-t-il des alternatives plus saines ?",
                "Comment lire une étiquette nutritionnelle ?"
              ].map((question, index) => (
                <Link
                  key={index}
                  to="/chat"
                  state={{ initialMessage: question }}
                  className="text-sm bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 px-4 py-3 rounded-lg transition-all duration-200 text-center text-gray-700 hover:text-purple-700"
                >
                  {question}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECHERCHE ALGOLIA ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🔍 Recherche Instantanée
            </h2>
            <p className="text-xl text-gray-600">
              Explorez notre base de données de 99 produits analysés
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Recherche alimentée par Algolia
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">⚡</span>
                    <div>
                      <strong>Recherche instantanée</strong> avec tolérance aux fautes de frappe
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">🏷️</span>
                    <div>
                      <strong>Filtres avancés</strong> par groupe NOVA, catégorie, statut
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">📊</span>
                    <div>
                      <strong>Métadonnées complètes</strong> avec scores et badges
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">🔗</span>
                    <div>
                      <strong>Intégration directe</strong> avec l'analyse NOVA et le chat IA
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-600 text-sm mb-2">Exemples de recherches :</p>
                    <div className="space-y-2">
                      <div className="bg-white px-3 py-2 rounded text-sm text-gray-700">"bio" → 15 résultats</div>
                      <div className="bg-white px-3 py-2 rounded text-sm text-gray-700">"nutella" → 3 résultats</div>
                      <div className="bg-white px-3 py-2 rounded text-sm text-gray-700">"sans additifs" → 8 résultats</div>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/search"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explorer la base de données
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOURCES ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Sources scientifiques</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl mb-3">🏥</div>
                <p className="text-gray-700 font-bold">INSERM 2024</p>
                <p className="text-sm text-gray-500">Classification NOVA</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🇪🇺</div>
                <p className="text-gray-700 font-bold">EFSA</p>
                <p className="text-sm text-gray-500">Additifs alimentaires</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🧪</div>
                <p className="text-gray-700 font-bold">ANSES</p>
                <p className="text-sm text-gray-500">Sécurité alimentaire</p>
              </div>
              <div>
                <div className="text-3xl mb-3">📊</div>
                <p className="text-gray-700 font-bold">PNNS</p>
                <p className="text-sm text-gray-500">Nutrition santé</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                <strong>🌱 Transparence scientifique :</strong> Toutes nos analyses s'appuient sur des
                sources officielles et des études scientifiques validées pour garantir la fiabilité
                de nos recommandations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={handleCloseScanner}
          isOpen={true}
        />
      )}
    </div>
  );
};

export default HomePage;