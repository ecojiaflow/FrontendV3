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
            <Route path="/dashboard" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h2 className="text-2xl font-bold mb-4">🚧 Dashboard Coming Soon</h2>
                  <button onClick={() => window.location.href = '/'} className="bg-green-500 text-white px-6 py-2 rounded">
                    Go Home
                  </button>
                </div>
              </div>
            } />
            <Route path="*" element={<ProductNotFoundPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
