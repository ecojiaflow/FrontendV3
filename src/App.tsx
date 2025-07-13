// src/App.tsx - VERSION SIMPLIFIÉE POUR FIX BUILD
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading pour éviter les dépendances circulaires
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center text-center p-6">
    <div>
      <h1 className="text-3xl font-bold mb-4 text-green-600">404</h1>
      <p className="text-gray-600">Page non trouvée</p>
      <a href="/" className="text-green-600 underline mt-4 inline-block">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/produit/:slug" element={<Navigate to="/product/:slug" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Export explicite pour éviter tout problème
export default App;