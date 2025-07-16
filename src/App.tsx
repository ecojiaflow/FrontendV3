// PATH: frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Scan from './pages/Scan';
import Results from './pages/Results';
import Demo from './pages/Demo';
import ProductPage from './pages/ProductPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-8">
                  <Link to="/" className="flex items-center space-x-2">
                    <span className="text-2xl">🌱</span>
                    <span className="text-xl font-bold text-green-600">ECOLOJIA</span>
                  </Link>
                  
                  <div className="hidden md:flex items-center space-x-6">
                    <Link 
                      to="/" 
                      className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    >
                      Accueil
                    </Link>
                    <Link 
                      to="/scan" 
                      className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    >
                      Scanner
                    </Link>
                    <Link 
                      to="/results" 
                      className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    >
                      Analyse NOVA
                    </Link>
                    <Link 
                      to="/demo" 
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      🔬 Démo IA
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center text-sm text-gray-600">
                    <span className="mr-2">🤖</span>
                    <span>IA NOVA active</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Contenu principal */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/results" element={<Results />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/product/:slug" element={<ProductPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🌱</span>
                    <span className="text-xl font-bold text-green-600">ECOLOJIA</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Intelligence Artificielle pour une consommation responsable et éclairée.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Fonctionnalités</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>🔬 Classification NOVA automatique</li>
                    <li>⚗️ Détection d'additifs alimentaires</li>
                    <li>🎯 Recommandations personnalisées</li>
                    <li>📚 Sources scientifiques transparentes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-800 mb-4">Sources</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>🏥 INSERM 2024</li>
                    <li>🇪🇺 EFSA (Autorité européenne)</li>
                    <li>🧪 ANSES</li>
                    <li>📊 Classification NOVA officielle</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-8 pt-6 text-center">
                <p className="text-gray-600 text-sm">
                  © 2025 ECOLOJIA • Révolution de la consommation responsable
                </p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
// EOF