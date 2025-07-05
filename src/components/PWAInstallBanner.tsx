import React, { useState, useEffect } from 'react';
import { Download, X, Leaf } from 'lucide-react';

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  // Détection mobile simple
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isIOS) {
      alert(`📱 Installation iPhone/iPad

1. Touchez le bouton Partager ⎍ en bas
2. Sélectionnez "Sur l'écran d'accueil"  
3. Touchez "Ajouter"

Votre scanner ECOLOJIA sera accessible depuis l'écran d'accueil !`);
    } else if (isAndroid) {
      alert(`📱 Installation Android

1. Menu Chrome ⋮ → "Installer l'application"
2. OU barre d'adresse → icône Installer
3. OU Favoris → "Ajouter à l'écran d'accueil"

Votre scanner ECOLOJIA sera accessible depuis l'écran d'accueil !`);
    } else {
      alert(`💻 Installation Desktop

1. Barre d'adresse → icône "Installer"
2. OU Menu navigateur → "Installer l'application"

ECOLOJIA sera accessible depuis votre bureau !`);
    }
    
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('ecolojia-banner-dismissed', 'true');
  };

  // Vérifier si déjà fermé
  useEffect(() => {
    if (sessionStorage.getItem('ecolojia-banner-dismissed')) {
      setShowBanner(false);
    }
  }, []);

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!showBanner || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-leaf/20 shadow-lg z-40 block md:hidden animate-slide-up">
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 bg-eco-leaf rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-eco-text text-sm">
                📱 Installer ECOLOJIA
              </h3>
              <p className="text-xs text-eco-text/70">
                Scanner + accès rapide depuis l'écran d'accueil
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="bg-eco-leaf text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-eco-leaf/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>INSTALLER</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;