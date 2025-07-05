import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import CategoryNavigation from './components/CategoryNavigation';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import PWAInstallBanner from './components/PWAInstallBanner';
import ProductNotFoundPage from './pages/ProductNotFoundPage';

import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import PrivacyPage from './pages/PrivacyPage';
import LegalPage from './pages/LegalPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import SearchResultsPage from './pages/SearchResultsPage';

const App: React.FC = () => {
  // Vérifier si la requête est pour des fichiers PWA
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    
    // Si c'est un fichier PWA, rediriger directement
    if (currentPath === '/sw.js' || 
        currentPath === '/manifest.json' || 
        currentPath.startsWith('/icons/')) {
      
      console.log('🔧 Requête fichier PWA détectée:', currentPath);
      
      // Forcer la navigation directe vers le fichier
      window.location.replace(currentPath);
      return;
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
          <Navbar />
          <CategoryNavigation />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/scan/not-found" element={<ProductNotFoundPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Route catch-all SAUF pour fichiers PWA */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page non trouvée</p>
                      <a 
                        href="/" 
                        className="bg-eco-leaf text-white px-6 py-3 rounded-lg hover:bg-eco-leaf/90 transition-colors"
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>

          <Footer />
          <CookieBanner />
          <PWAInstallBanner />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;