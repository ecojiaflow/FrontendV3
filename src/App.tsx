// PATH: frontend/ecolojiaFrontV3/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ✅ SOLUTION NETLIFY: Tous les imports directs (pas de lazy loading)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ✅ Pages principales - imports directs
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage'; // ✅ Import direct
import Results from './pages/Results';
import Scan from './pages/Scan';
import Demo from './pages/Demo';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            {/* ===== PAGES PRINCIPALES ===== */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product-not-found" element={<ProductNotFoundPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* ===== DASHBOARD - Import direct ===== */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* ===== SCAN & RÉSULTATS ===== */}
            <Route path="/scan" element={<Scan />} />
            <Route path="/results" element={<Results />} />
            <Route path="/analyze" element={<ProductPage />} />
            
            {/* ===== DÉMO ===== */}
            <Route path="/demo" element={<Demo />} />
            
            {/* ===== PAGES LÉGALES INTÉGRÉES ===== */}
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
                      
                      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm">
                          <strong>🌱 Transparence scientifique :</strong> Toutes nos analyses s'appuient sur des
                          sources officielles et des études scientifiques validées pour garantir la fiabilité
                          de nos recommandations.
                        </p>
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
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                      🔒 Politique de confidentialité
                    </h1>
                    <div className="prose max-w-none text-gray-600 space-y-4">
                      <p>
                        ECOLOJIA respecte votre vie privée et la protection de vos données personnelles 
                        conformément au RGPD.
                      </p>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        📊 Données collectées
                      </h2>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Produits analysés (anonymisés)</li>
                        <li>Préférences utilisateur</li>
                        <li>Données d'usage (anonymisées)</li>
                      </ul>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        🎯 Utilisation des données
                      </h2>
                      <p>
                        Vos données sont utilisées exclusivement pour améliorer nos analyses IA 
                        et personnaliser votre expérience.
                      </p>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        🔒 Sécurité
                      </h2>
                      <p>
                        Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                        pour protéger vos données contre tout accès, modification, divulgation ou 
                        destruction non autorisés.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            } />
            
            <Route path="/terms" element={
              <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                      📋 Conditions d'utilisation
                    </h1>
                    <div className="prose max-w-none text-gray-600 space-y-4">
                      <p>
                        En utilisant ECOLOJIA, vous acceptez nos conditions d'utilisation.
                      </p>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        🔬 Service fourni
                      </h2>
                      <p>
                        ECOLOJIA fournit des analyses informatives basées sur des données 
                        scientifiques publiques (INSERM, ANSES, EFSA).
                      </p>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        ⚠️ Limitation de responsabilité
                      </h2>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                          <strong>Important :</strong> Les analyses fournies sont à titre informatif 
                          et ne constituent pas des conseils médicaux. Consultez un professionnel 
                          de santé pour des décisions médicales.
                        </p>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        🔄 Disponibilité du service
                      </h2>
                      <p>
                        Nous nous efforçons de maintenir le service disponible 24h/24, mais ne 
                        garantissons pas une disponibilité ininterrompue.
                      </p>
                      
                      <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                        📞 Contact
                      </h2>
                      <p>
                        Pour toute question concernant ces conditions d'utilisation, contactez-nous 
                        via notre interface de chat ou à support@ecolojia.fr
                      </p>
                    </div>
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
                  <p className="text-gray-600 mb-6">
                    La page que vous cherchez n'existe pas ou a été déplacée.
                  </p>
                  <div className="space-x-4">
                    <a 
                      href="/" 
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      🏠 Accueil
                    </a>
                    <a 
                      href="/search" 
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      🔍 Rechercher
                    </a>
                    <a 
                      href="/dashboard" 
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      📊 Dashboard
                    </a>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;