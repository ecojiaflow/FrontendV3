// REMPLACER dans src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import ChatPage from './pages/ChatPage';
import CategoryPage from './pages/CategoryPage';
import MultiCategoriesPage from './pages/MultiCategoriesPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
import DashboardPage from './pages/DashboardPage'; // ✅ AJOUTER CETTE LIGNE
import Scan from './pages/Scan';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/analyze" element={<ProductPage />} />
            <Route path="/results" element={<ProductPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/multi-categories" element={<MultiCategoriesPage />} />
            <Route path="/not-found" element={<ProductNotFoundPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* ✅ REMPLACER cette route par : */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="*" element={<ProductNotFoundPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;