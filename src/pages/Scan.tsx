// PATH: frontend/ecolojiaFrontV3/src/pages/Scan.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from '../components/scanner/BarcodeScanner';

const Scan: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = useCallback((barcode: string) => {
    console.log('Code-barres scanné:', barcode);
    setShowScanner(false);
    
    // Rediriger vers les résultats avec le code-barres
    const params = new URLSearchParams({
      barcode,
      method: 'scan'
    });
    navigate(`/results?${params.toString()}`);
  }, [navigate]);

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false);
  }, []);

  const openScanner = useCallback(() => {
    setShowScanner(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Retour
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              🌱 Scanner ECOLOJIA
            </h1>
            <div className="w-8"></div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-lg mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Scanner de codes-barres
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-sm">
            Scannez le code-barres de votre produit pour une analyse instantanée
          </p>
          
          <button
            onClick={openScanner}
            className="bg-[#7DDE4A] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#6BC93A] transition-colors shadow-lg text-lg mb-6"
          >
            🎯 Ouvrir le scanner
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Formats supportés :</p>
            <div className="flex justify-center space-x-3 text-xs">
              <span className="px-3 py-1 bg-gray-100 rounded-full">EAN-13</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">UPC-A</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">CODE-128</span>
            </div>
          </div>
        </div>
      </main>

      {/* Scanner modal */}
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

export default Scan;