import React from 'react';
import { Smartphone, Download, X, Leaf } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();

  // Ne pas afficher si déjà installé ou en mode standalone
  if (!showInstallBanner || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    const success = await triggerInstall();
    if (!success) {
      // Fallback : Instructions manuelles si l'API n'est pas disponible
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = 'Sur Safari : Touchez le bouton Partager puis "Sur l\'écran d\'accueil"';
    } else if (isAndroid) {
      instructions = 'Sur Chrome : Menu (⋮) → "Installer l\'application"';
    } else {
      instructions = 'Dans votre navigateur : Menu → "Installer ECOLOJIA"';
    }

    alert(`📱 Installation manuelle :\n\n${instructions}`);
  };

  return (
    <>
      {/* Banner mobile en bas d'écran */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-leaf/20 shadow-lg z-40 animate-fade-in-up md:hidden">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            {/* Logo + App info */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-eco-leaf rounded-xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-eco-text text-sm">
                  Installer ECOLOJIA
                </h3>
                <p className="text-xs text-eco-text/70 line-clamp-1">
                  Accès rapide au scanner + mode hors ligne
                </p>
              </div>
            </div>

            {/* Boutons action */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                className="bg-eco-leaf text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-eco-leaf/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Installer</span>
              </button>
              
              <button
                onClick={dismissBanner}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner desktop discret */}
      <div className="hidden md:block fixed top-20 right-4 max-w-sm bg-white rounded-xl shadow-lg border border-eco-leaf/20 z-30 animate-fade-in">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-eco-leaf rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-eco-text mb-1">
                Application ECOLOJIA
              </h3>
              <p className="text-sm text-eco-text/70 mb-4">
                Scanner mobile + notifications + mode hors ligne
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  className="bg-eco-leaf text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-eco-leaf/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Installer</span>
                </button>
                
                <button
                  onClick={dismissBanner}
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  Plus tard
                </button>
              </div>
            </div>
            
            <button
              onClick={dismissBanner}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PWAInstallBanner;