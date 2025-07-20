// PATH: frontend/ecolojiaFrontV3/src/App.tsx
import React, { useState, useEffect, Suspense } from 'react';
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
  Plus,
  Search,
  Camera,
  Package,
  CheckCircle,
  Eye,
  Sparkles,
  Upload
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

// ✅ NOUVEAU : Hook pour gérer les états de chargement
const useAnalysisProgress = (category: string) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    { label: 'Initialisation...', duration: 500 },
    { label: 'Analyse composition...', duration: 1500 },
    { label: 'Calcul score ECOLOJIA...', duration: 1000 },
    { label: 'Recherche alternatives...', duration: 800 },
    { label: 'Finalisation...', duration: 200 }
  ];

  const simulateAnalysis = async () => {
    for (let i = 0; i < stages.length; i++) {
      setStage(i);
      setProgress(0);
      
      const duration = stages[i].duration;
      const steps = 20;
      const stepDuration = duration / steps;
      
      for (let j = 0; j <= steps; j++) {
        setProgress((j / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  };

  return { stage, progress, simulateAnalysis };
};

// ✅ NOUVEAU : Composant Loading States intégré
interface SmartLoadingProps {
  stage: number;
  progress: number;
  category: string;
}

const SmartLoading: React.FC<SmartLoadingProps> = ({ stage, progress, category }) => {
  const stages = [
    { 
      label: 'Initialisation...', 
      icon: <Zap className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    { 
      label: 'Analyse composition...', 
      icon: <Eye className="w-6 h-6" />,
      color: 'text-green-500'
    },
    { 
      label: 'Calcul score ECOLOJIA...', 
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-purple-500'
    },
    { 
      label: 'Recherche alternatives...', 
      icon: <Search className="w-6 h-6" />,
      color: 'text-orange-500'
    },
    { 
      label: 'Finalisation...', 
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-600'
    }
  ];

  const categoryEmojis = {
    food: '🍎',
    cosmetics: '🧴',
    detergents: '🧽'
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {categoryEmojis[category] || '📦'}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Analyse en cours...
        </h2>
        <p className="text-gray-600 mt-2">
          Notre IA analyse votre produit {category === 'food' ? 'alimentaire' : category === 'cosmetics' ? 'cosmétique' : 'détergent'}
        </p>
      </div>

      {/* Étapes */}
      <div className="space-y-4 mb-6">
        {stages.map((stageInfo, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              index < stage ? 'bg-green-100 text-green-600' :
              index === stage ? `${stageInfo.color.replace('text-', 'text-')} bg-current bg-opacity-10` :
              'bg-gray-100 text-gray-400'
            }`}>
              {index < stage ? (
                <CheckCircle className="w-4 h-4" />
              ) : index === stage ? (
                <div className="w-3 h-3 bg-current rounded-full animate-pulse"></div>
              ) : (
                <div className="w-3 h-3 bg-current rounded-full opacity-30"></div>
              )}
            </div>
            <span className={`ml-3 text-sm ${
              index <= stage ? 'text-gray-800 font-medium' : 'text-gray-500'
            }`}>
              {stageInfo.label}
            </span>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          {Math.round(progress)}% terminé
        </p>
      </div>

      {/* Messages informatifs */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Le saviez-vous ?</strong>
          {category === 'food' && ' ECOLOJIA détecte automatiquement les produits ultra-transformés selon la classification NOVA.'}
          {category === 'cosmetics' && ' Notre IA identifie les perturbateurs endocriniens selon les listes officielles européennes.'}
          {category === 'detergents' && ' Nous analysons l\'impact environnemental selon les standards OECD et Ecolabel.'}
        </p>
      </div>
    </div>
  );
};

// ✅ NOUVEAU : Interface de recherche universelle simplifiée intégrée
interface QuickSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const QuickUniversalSearch: React.FC<QuickSearchProps> = ({ 
  onSearch, 
  placeholder = "🔍 Rechercher un produit..." 
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulation d'une recherche
    setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      } else {
        // Redirection par défaut
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
      setIsSearching(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl shadow-sm focus-within:border-green-500 focus-within:shadow-md transition-all">
        <Search className="absolute left-4 h-5 w-5 text-gray-400" />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isSearching}
          className="flex-1 px-12 py-4 bg-transparent border-0 focus:outline-none text-gray-800 placeholder-gray-500"
        />

        <div className="flex items-center space-x-2 px-4">
          <button
            onClick={() => window.location.href = '/search'}
            className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
            title="Scanner code-barres"
          >
            <Camera className="h-4 w-4" />
          </button>

          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Chercher'
            )}
          </button>
        </div>
      </div>

      {/* Suggestions rapides */}
      <div className="mt-2 flex flex-wrap gap-2">
        {['nutella bio', 'shampoing sans sulfate', 'lessive écologique'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// ✅ SOLUTION BULLETPROOF: Page Multi-Produits avec Loading States intégrés
const MultiProductScanPageBuiltIn: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'food' | 'cosmetics' | 'detergents'>('food');
  const [scanMode, setScanMode] = useState<'barcode' | 'manual' | 'search'>('search');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // ✅ NOUVEAU : Hook pour gérer les états de chargement
  const { stage, progress, simulateAnalysis } = useAnalysisProgress(selectedCategory);

  const categories = [
    {
      id: 'food' as const,
      name: 'Alimentaire',
      icon: '🍎',
      description: 'Analyse NOVA & ultra-transformation',
      examples: ['Plats préparés', 'Boissons', 'Snacks', 'Conserves']
    },
    {
      id: 'cosmetics' as const,
      name: 'Cosmétiques',
      icon: '🧴',
      description: 'Perturbateurs endocriniens & allergènes',
      examples: ['Crèmes', 'Shampooings', 'Maquillage', 'Parfums']
    },
    {
      id: 'detergents' as const,
      name: 'Détergents',
      icon: '🧽',
      description: 'Impact environnemental & toxicité',
      examples: ['Lessives', 'Produits ménagers', 'Savons', 'Dégraissants']
    }
  ];

  // ✅ NOUVEAU : Fonction d'analyse avec états de chargement
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Démarrer la simulation d'analyse avec états
      await simulateAnalysis();
      
      // Après l'analyse, rediriger vers les résultats
      setTimeout(() => {
        window.location.href = '/search';
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      setIsAnalyzing(false);
    }
  };

  // ✅ NOUVEAU : Si en cours d'analyse, afficher les états de chargement
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <SmartLoading 
          stage={stage} 
          progress={progress} 
          category={selectedCategory} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">
              🔍 Analyseur Multi-Produits ECOLOJIA
            </h1>
            
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header avec titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Analysez tous vos produits du quotidien
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analysez la composition de vos produits alimentaires, cosmétiques et détergents 
            avec notre IA scientifique avancée
          </p>
        </div>

        {/* ✅ NOUVEAU : Recherche universelle intégrée */}
        <div className="max-w-2xl mx-auto mb-8">
          <QuickUniversalSearch 
            placeholder={`🔍 Rechercher un produit ${selectedCategory === 'food' ? 'alimentaire' : selectedCategory === 'cosmetics' ? 'cosmétique' : 'détergent'}...`}
          />
        </div>

        {/* Sélecteur de catégorie */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Choisissez la catégorie de produit
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-card cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 justify-center">
                    {category.examples.map((example, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedCategory === category.id && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      ✓ Sélectionné
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mode de scan */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-center mb-4">
            Comment souhaitez-vous analyser le produit ?
          </h2>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setScanMode('search')}
              className={`mode-btn flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                scanMode === 'search'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>🔍</span>
              <span>Recherche Universelle</span>
            </button>

            <button
              onClick={() => setScanMode('barcode')}
              className={`mode-btn flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                scanMode === 'barcode'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>📷</span>
              <span>Scanner Code-barres</span>
            </button>
            
            <button
              onClick={() => setScanMode('manual')}
              className={`mode-btn flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                scanMode === 'manual'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>✏️</span>
              <span>Saisie Manuelle</span>
            </button>
          </div>
        </div>

        {/* Interface principale */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {scanMode === 'search' ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    🌍 Recherche Universelle ECOLOJIA
                  </h3>
                  <p className="text-gray-600">
                    Recherche dans toutes nos bases : Algolia + OpenFoodFacts + Base locale
                  </p>
                </div>
                
                <QuickUniversalSearch 
                  placeholder={`Rechercher parmi des millions de produits ${selectedCategory}...`}
                  onSearch={(query) => {
                    window.location.href = `/search?q=${encodeURIComponent(query)}&category=${selectedCategory}`;
                  }}
                />
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    🚀 Recherche Multi-Sources
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• <strong>Algolia :</strong> Base ECOLOJIA avec scores IA</li>
                    <li>• <strong>OpenFoodFacts :</strong> 2M+ produits alimentaires</li>
                    <li>• <strong>Base locale :</strong> Produits analysés par nos experts</li>
                    <li>• <strong>Enrichissement IA :</strong> Score ECOLOJIA automatique</li>
                  </ul>
                </div>
              </div>
            ) : scanMode === 'barcode' ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Scanner le Code-barres
                  </h3>
                  <p className="text-gray-600">
                    Pointez votre caméra vers le code-barres du produit
                  </p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-600 mb-4">Scanner de code-barres universel</p>
                  <button
                    onClick={() => window.location.href = '/scan'}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Activer le scanner
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Nouveau :</strong> Notre scanner détecte automatiquement la catégorie 
                    et enrichit les données avec OpenFoodFacts si nécessaire.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Saisie Manuelle
                  </h3>
                  <p className="text-gray-600">
                    Entrez les informations du produit manuellement
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Shampoing doux, Lessive écologique..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: L'Oréal, Ariel, Danone..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedCategory === 'food' ? 'Liste des ingrédients' :
                     selectedCategory === 'cosmetics' ? 'Liste INCI' :
                     'Composition'}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      selectedCategory === 'food' 
                        ? 'Ex: eau, farine de blé, sucre, levure...'
                        : selectedCategory === 'cosmetics'
                        ? 'Ex: aqua, sodium lauryl sulfate, parfum...'
                        : 'Ex: tensioactifs anioniques, phosphates...'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-lg"
                >
                  🔬 Analyser le produit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Call to action recherche universelle */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 max-w-4xl mx-auto border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center justify-center">
              ✨ Recherche Universelle ECOLOJIA
            </h3>
            <p className="text-purple-700 mb-4">
              Découvrez notre moteur de recherche révolutionnaire qui combine toutes les sources 
              pour vous offrir les résultats les plus complets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-medium text-purple-700">Multi-Sources</div>
                <div className="text-purple-600">Algolia + OpenFoodFacts + Base locale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-medium text-purple-700">IA Enrichissement</div>
                <div className="text-purple-600">Score ECOLOJIA automatique</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-purple-700">Temps Réel</div>
                <div className="text-purple-600">Résultats en moins de 2 secondes</div>
              </div>
            </div>
            <a
              href="/search"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              🚀 Essayer la Recherche Universelle
            </a>
          </div>
        </div>

        {/* Fonctionnalités par catégorie */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Analyses spécialisées par catégorie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alimentaire */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🍎</div>
                <h3 className="font-semibold text-gray-800">Alimentaire</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Classification NOVA (INSERM)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Détection ultra-transformation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Analyse additifs E-numbers
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Score nutritionnel Nutri-Score
                </li>
              </ul>
            </div>

            {/* Cosmétiques */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🧴</div>
                <h3 className="font-semibold text-gray-800">Cosmétiques</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Perturbateurs endocriniens
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Allergènes réglementaires
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Analyse INCI complète
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Score naturalité
                </li>
              </ul>
            </div>

            {/* Détergents */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🧽</div>
                <h3 className="font-semibold text-gray-800">Détergents</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Toxicité vie aquatique
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Biodégradabilité OECD
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Émissions COV
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Labels écologiques
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer informatif */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center justify-center">
              <Star className="w-5 h-5 mr-2" />
              Pourquoi ECOLOJIA ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🔬</div>
                <div className="font-medium text-blue-700">IA Scientifique</div>
                <div className="text-blue-600">Analyses basées sur INSERM, ANSES, EFSA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-medium text-blue-700">Multi-Catégories</div>
                <div className="text-blue-600">Seule plateforme 3-en-1 en Europe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-blue-700">Temps Réel</div>
                <div className="text-blue-600">Résultats instantanés et fiables</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        {/* NOUVEAU: Bannière Recherche Universelle */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                ✨ Nouveau : Recherche Universelle
              </h3>
              <p className="text-purple-700 text-sm">
                Recherchez parmi des millions de produits avec notre moteur multi-sources
              </p>
            </div>
            <a
              href="/search"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
            >
              🚀 Découvrir
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
              🔍 Recherche Universelle
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

// ✅ NOUVEAU : Page Recherche Universelle intégrée
const UniversalSearchPageBuiltIn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Récupérer query depuis URL si présente
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">
              🌍 Recherche Universelle ECOLOJIA
            </h1>
            
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Interface de recherche principale */}
        <div className="mb-8">
          <QuickUniversalSearch 
            placeholder="🔍 Recherchez parmi des millions de produits... (nutella bio, shampoing sans sulfate, lessive écologique)"
          />
        </div>

        {/* Statistiques de recherche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-blue-600">2M+</div>
            <div className="text-sm text-gray-600">Produits alimentaires</div>
            <div className="text-xs text-gray-500 mt-1">OpenFoodFacts</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600">50K+</div>
            <div className="text-sm text-gray-600">Produits analysés</div>
            <div className="text-xs text-gray-500 mt-1">Base ECOLOJIA</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Catégories</div>
            <div className="text-xs text-gray-500 mt-1">Alimentaire, Cosmétique, Détergent</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">&lt;2s</div>
            <div className="text-sm text-gray-600">Temps de réponse</div>
            <div className="text-xs text-gray-500 mt-1">Recherche multi-sources</div>
          </div>
        </div>

        {/* Suggestions populaires */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔥 Recherches populaires
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { query: 'nutella bio', icon: '🍫', category: 'food' },
              { query: 'shampoing sans sulfate', icon: '🧴', category: 'cosmetics' },
              { query: 'lessive écologique', icon: '🧽', category: 'detergents' },
              { query: 'yaourt sans additifs', icon: '🥛', category: 'food' },
              { query: 'crème bio visage', icon: '✨', category: 'cosmetics' },
              { query: 'liquide vaisselle bio', icon: '🌿', category: 'detergents' },
              { query: 'céréales petit déjeuner', icon: '🥣', category: 'food' },
              { query: 'dentifrice naturel', icon: '🦷', category: 'cosmetics' }
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => window.location.href = `/search?q=${encodeURIComponent(suggestion.query)}`}
                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <span className="text-2xl mr-3">{suggestion.icon}</span>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{suggestion.query}</div>
                  <div className="text-xs text-gray-500 capitalize">{suggestion.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informations sur les sources */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            🌍 Sources de données
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Algolia</h3>
              <p className="text-sm text-gray-600">
                Base ECOLOJIA avec scores IA propriétaires et analyses expertes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">OpenFoodFacts</h3>
              <p className="text-sm text-gray-600">
                2+ millions de produits alimentaires avec données nutritionnelles
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Base Locale</h3>
              <p className="text-sm text-gray-600">
                Produits analysés par nos experts avec scores santé détaillés
              </p>
            </div>
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
              
              {/* 🚀 NOUVEAU: ROUTES MULTI-PRODUITS INTÉGRÉES ===== */}
              <Route path="/multi-scan" element={<MultiProductScanPageBuiltIn />} />
              <Route path="/cosmetics" element={<MultiProductScanPageBuiltIn />} />
              <Route path="/detergents" element={<MultiProductScanPageBuiltIn />} />
              
              {/* 🌍 NOUVEAU: RECHERCHE UNIVERSELLE ===== */}
              <Route path="/universal-search" element={<UniversalSearchPageBuiltIn />} />
              
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