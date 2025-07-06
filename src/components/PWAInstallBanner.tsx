import React, { useState, useEffect } from 'react';
import { Download, X, Leaf, Smartphone } from 'lucide-react';

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem('ecolojia-banner-dismissed');

    if (isMobile && !dismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = () => {
    alert("📲 Pour installer l'application, utilisez le menu de votre navigateur.");
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('ecolojia-banner-dismissed', 'true');
  };

  const resetBanner = () => {
    sessionStorage.removeItem('ecolojia-banner-dismissed');
    setShowBanner(true);
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <>
      {showBanner && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-eco-leaf shadow-lg z-40 animate-slide-up">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-14 h-14 bg-eco-leaf rounded-xl flex items-center justify-center shadow-md">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-eco-text text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Installer ECOLOJIA
                  </h3>
                  <p className="text-sm text-eco-text/80">
                    🌱 Ajoutez à l'écran d'accueil
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-eco-leaf to-green-500 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 hover:scale-105 transition-transform shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>Installer</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showBanner && isMobile && (
        <button
          onClick={resetBanner}
          className="fixed bottom-4 right-4 bg-eco-leaf text-white p-3 rounded-full shadow-lg z-50 md:hidden"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default PWAInstallBanner;
