// PATH: frontend/src/pages/Scan.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Scan: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Scanner mobile
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fonctionnalité en cours de développement
          </p>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Le scanner de codes-barres et la reconnaissance OCR d'étiquettes 
            seront bientôt disponibles pour analyser vos produits en temps réel.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-gray-600">
              <span className="mr-3">📸</span>
              <span>Reconnaissance de codes-barres</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <span className="mr-3">🔍</span>
              <span>OCR d'étiquettes produits</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <span className="mr-3">📱</span>
              <span>Application PWA installable</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/demo" 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Essayer la démo
            </Link>
            <Link 
              to="/results" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Analyse manuelle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;