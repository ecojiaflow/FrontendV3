// PATH: frontend/ecolojiaFrontV3/src/App.tsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Leaf,
  AlertTriangle,
  Star,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';

// ✅ Imports sûrs qui fonctionnent
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ✅ Pages principales
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
import ChatPage from './pages/ChatPage';
import Results from './pages/Results';
import Scan from './pages/Scan';
import Demo from './pages/Demo';

// 🚀 NOUVEAU: Import multi-produits avec lazy loading
const MultiProductScanPage = lazy(() => import('./pages/MultiProductScanPage'));

// ✅ SOLUTION BULLETPROOF: Dashboard intégré directement dans App.tsx
const DashboardPageBuiltIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 47,
    averageScore: 73,
    improvementRate: 15.2,
    currentStreak: 7
  });

  useEffect(() => {
    // Simulation du chargement
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chargement de votre dashboard...</h3>
          <p className="text-gray-600">Calcul de vos métriques santé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              📊 Dashboard ECOLOJIA
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify(stats, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ecolojia-data-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Exporter mes données"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* NOUVEAU: Bannière Multi-Produits */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                ✨ Nouveau : Analyse Multi-Produits
              </h3>
              <p className="text-purple-700 text-sm">
                Analysez maintenant cosmétiques et détergents avec notre IA spécialisée
              </p>
            </div>
            <a
              href="/multi-scan"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              Découvrir
            </a>
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Score Global */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Score Santé</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.averageScore}
              </div>
              <div className="text-sm text-gray-500">sur 100</div>
              <div className="mt-2 text-sm font-medium text-green-600">
                ↗️ +{stats.improvementRate} pts
              </div>
            </div>
          </div>

          {/* Analyses totales */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Analyses</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalAnalyses}
              </div>
              <div className="text-sm text-gray-500">produits analysés</div>
              <div className="mt-2 text-sm font-medium text-blue-600">
                📈 +12 ce mois
              </div>
            </div>
          </div>

          {/* Série active */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Série active</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-gray-500">
                jour{stats.currentStreak > 1 ? 's' : ''}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                🔥 Continue comme ça !
              </div>
            </div>
          </div>

          {/* Ultra-transformés */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Ultra-transformés</h3>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                23%
              </div>
              <div className="text-sm text-gray-500">de vos produits</div>
              <div className="mt-2 text-xs text-gray-400">
                ✅ Excellent !
              </div>
            </div>
          </div>
        </div>

        {/* Section progression */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution du score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Évolution de votre score</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white">
                  7j
                </button>
                <button className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-600">
                  30j
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                const score = 65 + Math.random() * 20;
                const scans = Math.floor(1 + Math.random() * 4);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 w-12">
                      {day}
                    </div>
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mx-4">
                        <div 
                          className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className={`text-sm font-medium w-8 ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(score)}
                      </div>
                      <div className="text-xs text-gray-400 w-12">
                        {scans} scan{scans > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">💡 Insights IA</h3>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Nouveaux
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 text-sm">
                    Excellente progression cette semaine !
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Positif
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Votre score santé a progressé de +12 points. Continuez sur cette lancée !
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Analysez plus de produits bio pour maintenir cette amélioration
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 text-sm">
                    Attention aux additifs
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    Important
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  23% de vos produits contiennent des additifs controversés.
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Privilégiez les produits avec moins de 5 ingrédients
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 text-sm">
                    Objectif de la semaine
                  </h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    Challenge
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Atteignez 80 points de score santé moyen
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Plus que 7 points - vous y êtes presque !
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 Continuez votre parcours santé
          </h2>
          <p className="text-gray-600 mb-6">
            Analysez plus de produits pour affiner vos statistiques et débloquer de nouveaux insights
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/search"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              🔍 Analyser des produits
            </a>
            <a
              href="/multi-scan"
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              ✨ Multi-Produits
            </a>
            <a
              href="/chat"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              💬 Assistant IA
            </a>
            <a
              href="/scan"
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              📱 Scanner un produit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-800">Chargement...</h3>
              </div>
            </div>
          }>
            <Routes>
              {/* ===== PAGES PRINCIPALES ===== */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/product-not-found" element={<ProductNotFoundPage />} />
              <Route path="/chat" element={<ChatPage />} />
              
              {/* ===== DASHBOARD INTÉGRÉ (solution bulletproof) ===== */}
              <Route path="/dashboard" element={<DashboardPageBuiltIn />} />
              
              {/* 🚀 NOUVEAU: ROUTES MULTI-PRODUITS ===== */}
              <Route path="/multi-scan" element={<MultiProductScanPage />} />
              <Route path="/cosmetics" element={<MultiProductScanPage />} />
              <Route path="/detergents" element={<MultiProductScanPage />} />
              
              {/* ===== SCAN & RÉSULTATS ===== */}
              <Route path="/scan" element={<Scan />} />
              <Route path="/results" element={<Results />} />
              <Route path="/analyze" element={<ProductPage />} />
              
              {/* ===== DÉMO ===== */}
              <Route path="/demo" element={<Demo />} />
              
              {/* ===== PAGES LÉGALES ===== */}
              <Route path="/about" element={
                <div className="min-h-screen bg-gray-50 py-12">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        🌱 À propos d'ECOLOJIA
                      </h1>
                      <div className="prose max-w-none">
                        <p className="text-lg text-gray-600 mb-6">
                          ECOLOJIA est un assistant IA révolutionnaire qui vous aide à faire des choix 
                          de consommation plus conscients et responsables.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 Notre mission</h2>
                        <p className="text-gray-600 mb-6">
                          Démocratiser l'accès à l'information scientifique sur les produits de consommation 
                          grâce à l'intelligence artificielle et à l'analyse NOVA.
                        </p>
                        
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔬 Sources scientifiques</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800">INSERM</h3>
                            <p className="text-sm text-blue-600">Classification NOVA des aliments</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800">ANSES</h3>
                            <p className="text-sm text-green-600">Sécurité sanitaire alimentaire</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-purple-800">EFSA</h3>
                            <p className="text-sm text-purple-600">Autorité européenne sécurité aliments</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-orange-800">PNNS</h3>
                            <p className="text-sm text-orange-600">Programme National Nutrition Santé</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              } />
              
              <Route path="/privacy" element={
                <div className="min-h-screen bg-gray-50 py-12">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">🔒 Confidentialité</h1>
                      <p className="text-gray-600">
                        ECOLOJIA respecte votre vie privée conformément au RGPD.
                      </p>
                    </div>
                  </div>
                </div>
              } />
              
              <Route path="/terms" element={
                <div className="min-h-screen bg-gray-50 py-12">
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Conditions d'utilisation</h1>
                      <p className="text-gray-600">
                        Conditions d'utilisation d'ECOLOJIA - Service informatif uniquement.
                      </p>
                    </div>
                  </div>
                </div>
              } />
              
              {/* ===== 404 ===== */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🤔</div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Page introuvable</h1>
                    <p className="text-gray-600 mb-6">La page demandée n'existe pas.</p>
                    <a 
                      href="/" 
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      🏠 Retour à l'accueil
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;