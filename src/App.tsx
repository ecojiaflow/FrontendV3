import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import CategoryNavigation from './components/CategoryNavigation';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LegalPage from './pages/LegalPage';
import ProductPage from './pages/ProductPage';
import StatsPage from './pages/StatsPage';
import CategoryPage from './pages/CategoryPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-eco-leaf/5 to-white flex flex-col">
          <Navbar />
          <CategoryNavigation />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
            </Routes>
          </main>

          <Footer />
          <CookieBanner />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
