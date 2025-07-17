// PATH: frontend/ecolojiaFrontV3/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarcodeScanner from '../components/scanner/BarcodeScanner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleScanSuccess = (barcode: string) => {
    console.log('📱 Code-barres scanné:', barcode);
    setShowScanner(false);
    const params = new URLSearchParams({ barcode, method: 'scan' });
    navigate(`/results?${params.toString()}`);
  };

  const handleCloseScanner = () => setShowScanner(false);
  const openScanner = () => setShowScanner(true);

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <Leaf className="h-16 w-16 text-green-500 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Trouvez des produits <span className="text-green-500">éco-responsables</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Découvrez des milliers de produits éthiques avec des scores écologiques vérifiés par IA
          </p>

          {isMobile && (
            <div className="mb-8">
              <button
                onClick={openScanner}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 w-full max-w-sm mx-auto flex items-center justify-center space-x-2"
              >
                <span className="text-xl">📷</span>
                <span>Scanner un produit</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                📱 Scannez directement avec votre caméra
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher shampoing bio, jean éthique, miel local..."
                className="w-full py-4 px-12 pr-16 border-2 border-gray-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-800 placeholder-gray-500 bg-white"
                autoComplete="off"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
              >
                Rechercher des produits
              </button>
            </div>
          </form>

          <div className="text-gray-500 text-sm">
            Essayez la démonstration pour voir notre IA en action !
          </div>
        </div>
      </section>

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={handleCloseScanner}
          isOpen={true}
        />
      )}
    </div>
  );
};

export default HomePage;
// EOF
