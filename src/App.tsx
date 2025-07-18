// PATH: frontend/ecolojiaFrontV3/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import MultiCategoriesPage from './pages/MultiCategoriesPage';
import ProductNotFoundPage from './pages/ProductNotFoundPage';
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
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/multi-categories" element={<MultiCategoriesPage />} />
            <Route path="/not-found" element={<ProductNotFoundPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
// EOF