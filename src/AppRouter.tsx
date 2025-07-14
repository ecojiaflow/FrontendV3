// frontend/src/router/AppRouter.tsx
// Router principal avec ErrorBoundary pour capturer toutes les erreurs

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';

// Import des pages
import MultiCategoriesPage from '../pages/MultiCategoriesPage';
import ProductPage from '../pages/ProductPage';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Route par défaut - Multi-catégories */}
          <Route path="/" element={<MultiCategoriesPage />} />
          
          {/* Page multi-catégories */}
          <Route path="/categories" element={<MultiCategoriesPage />} />
          
          {/* Page produit */}
          <Route path="/product" element={<ProductPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          
          {/* Routes de test/démo */}
          <Route path="/demo" element={<MultiCategoriesPage />} />
          
          {/* Redirection des routes non trouvées */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;