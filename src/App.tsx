// PATH: frontend/ecolojiaFrontV3/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import ChatPage from './pages/ChatPage';
import CategoryPage from './pages/CategoryPage';
import MultiCategoriesPage from './pages/MultiCategoriesPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
import Scan from './pages/Scan';
import DashboardPage from './pages/DashboardPage'; // ✅ NOUVEAU
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<HomePage />} />
            
            {/* Page de recherche Algolia */}
            <Route path="/search" element={<SearchPage />} />
            
            {/* ✅ NOUVEAU: Page Dashboard Analytics */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* ✅ EXISTANT: Page de chat IA */}
            <Route path="/chat" element={<ChatPage />} />
            
            {/* ✅ EXISTANT: Page de scan mobile */}
            <Route path="/scan" element={<Scan />} />
            
            {/* Pages d'analyse NOVA - TOUTES LES VARIANTES */}
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/analyze" element={<ProductPage />} />
            <Route path="/results" element={<ProductPage />} />
            
            {/* Autres pages */}
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/multi-categories" element={<MultiCategoriesPage />} />
            <Route path="/not-found" element={<ProductNotFoundPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* ✅ EXISTANT: Route catch-all pour rediriger les URLs inconnues */}
            <Route path="*" element={<ProductNotFoundPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;