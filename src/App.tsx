import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import CategoryNavigation from './components/CategoryNavigation';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import PWAInstallBanner from './components/PWAInstallBanner';

// Pages existantes - Toutes vos vraies pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
import CategoryPage from './pages/CategoryPage';
import AboutPage from './pages/AboutPage';
import StatsPage from './pages/StatsPage';
import TermsPage from './pages/TermsPage';

// Page de recherche - Créer si manquante
const SearchResultsPage: React.FC = () => {
  // Rediriger vers HomePage qui gère déjà la recherche
  return <HomePage />;
};

// Pages simples pour navigation
const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-eco-text mb-4">Politique de confidentialité</h1>
        <p className="text-eco-text/70">Protection de vos données personnelles</p>
      </div>
      <div className="prose prose-lg max-w-none text-eco-text/80">
        <p className="mb-6">Cette page sera bientôt disponible avec tous les détails sur notre politique de confidentialité.</p>
        <p className="mb-6">ECOLOJIA respecte votre vie privée et la protection de vos données personnelles.</p>
        <div className="bg-eco-leaf/10 p-6 rounded-xl border border-eco-leaf/20">
          <h3 className="text-lg font-semibold text-eco-text mb-3">Informations collectées :</h3>
          <ul className="list-disc list-inside space-y-2 text-eco-text/70">
            <li>Données de navigation anonymisées</li>
            <li>Préférences de recherche (optionnel)</li>
            <li>Statistiques d'utilisation agrégées</li>
          </ul>
        </div>
        <p className="mt-6">
          En attendant, consultez nos{' '}
          <a href="/terms" className="text-eco-leaf hover:underline font-medium">
            conditions d'utilisation
          </a>{' '}
          pour plus d'informations.
        </p>
      </div>
    </div>
  </div>
);

const LegalPage: React.FC = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-eco-text mb-4">Mentions légales</h1>
        <p className="text-eco-text/70">Informations légales et réglementaires</p>
      </div>
      <div className="prose prose-lg max-w-none text-eco-text/80">
        <div className="bg-eco-leaf/10 p-6 rounded-xl border border-eco-leaf/20 mb-6">
          <h3 className="text-lg font-semibold text-eco-text mb-3">ECOLOJIA</h3>
          <div className="space-y-2 text-eco-text/70">
            <p><strong>Éditeur :</strong> ECOLOJIA</p>
            <p><strong>Email :</strong> contact@ecolojia.com</p>
            <p><strong>Hébergement :</strong> Netlify, Inc.</p>
          </div>
        </div>
        <p className="mb-6">
          ECOLOJIA est un moteur de recherche de produits éco-responsables utilisant l'intelligence artificielle 
          pour évaluer l'impact environnemental des produits de consommation.
        </p>
        <h3 className="text-xl font-semibold text-eco-text mb-3">Propriété intellectuelle</h3>
        <p className="mb-6">
          Le contenu de ce site, incluant les textes, images, logos et bases de données, 
          est protégé par les droits de propriété intellectuelle.
        </p>
        <p>
          Pour plus de détails, consultez nos{' '}
          <a href="/terms" className="text-eco-leaf hover:underline font-medium">
            conditions d'utilisation
          </a>.
        </p>
      </div>
    </div>
  </div>
);

const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-white py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-eco-text mb-4">Contact</h1>
        <p className="text-eco-text/70 text-lg">Une question ? Une suggestion ? Contactez-nous !</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-eco-leaf/10 p-8 rounded-xl border border-eco-leaf/20">
          <h3 className="text-xl font-semibold text-eco-text mb-4">Informations de contact</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-eco-leaf">📧</span>
              <div>
                <p className="font-medium text-eco-text">Email général</p>
                <p className="text-eco-text/70">contact@ecolojia.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-eco-leaf">🛠️</span>
              <div>
                <p className="font-medium text-eco-text">Support technique</p>
                <p className="text-eco-text/70">support@ecolojia.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-eco-leaf">💼</span>
              <div>
                <p className="font-medium text-eco-text">Partenariats</p>
                <p className="text-eco-text/70">partnerships@ecolojia.com</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-eco-text mb-4">Temps de réponse</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-eco-text/70">Questions générales</span>
              <span className="font-medium text-eco-text">24-48h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-eco-text/70">Support technique</span>
              <span className="font-medium text-eco-text">24h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-eco-text/70">Partenariats</span>
              <span className="font-medium text-eco-text">3-5 jours</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Astuce :</strong> Pour un support plus rapide, 
              précisez votre navigateur et l'appareil utilisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
          <Navbar />
          <CategoryNavigation />
          
          <main className="flex-grow">
            <Routes>
              {/* Pages principales */}
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              
              {/* Pages PWA */}
              <Route path="/scan/not-found" element={<ProductNotFoundPage />} />
              
              {/* Pages informatives - Vos vraies pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Pages complètes pour navigation */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Route 404 */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-center">
                      <div className="text-6xl mb-6">🔍</div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Cette page n'existe pas</p>
                      <div className="space-x-4">
                        <a 
                          href="/" 
                          className="bg-eco-leaf text-white px-6 py-3 rounded-lg hover:bg-eco-leaf/90 transition-colors inline-block"
                        >
                          Retour à l'accueil
                        </a>
                        <a 
                          href="/about" 
                          className="border border-eco-leaf text-eco-leaf px-6 py-3 rounded-lg hover:bg-eco-leaf/10 transition-colors inline-block"
                        >
                          À propos
                        </a>
                      </div>
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