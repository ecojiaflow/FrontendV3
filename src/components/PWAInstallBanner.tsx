import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Leaf } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();
  const [forceShow, setForceShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Force l'affichage après 2 secondes SEULEMENT sur mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      const timer = setTimeout(() => {
        if (!isStandalone) {
          console.log('📱 Affichage banner PWA mobile forcé');
          setForceShow(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  // Ne pas afficher si déjà installé
  if (isStandalone) {
    return null;
  }

  // Afficher SEULEMENT si mobile ET (hook dit oui OU forcé)
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shouldShow = isMobile && (showInstallBanner || forceShow);

  if (!shouldShow) {
    return null;
  }

  const handleInstall = async () => {
    console.log('🔧 Tentative installation PWA...');
    setIsInstalling(true);
    
    try {
      // Essayer l'API native d'installation
      const success = await triggerInstall();
      
      if (!success) {
        console.log('📱 API installation non disponible, toast simple');
        showSimpleToast();
      } else {
        console.log('✅ Installation PWA réussie');
        setForceShow(false); // Masquer le banner
      }
    } catch (error) {
      console.error('❌ Erreur installation:', error);
      showSimpleToast();
    } finally {
      setIsInstalling(false);
    }
  };

  // REMPLACER showManualInstructions par un toast simple NON-BLOQUANT
  const showSimpleToast = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    let message = '';
    if (isIOS) {
      message = '💡 Safari → Partager → "Sur l\'écran d\'accueil"';
    } else {
      message = '💡 Menu navigateur → "Installer l\'application"';
    }

    // Toast simple en haut, NON-BLOQUANT
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; 
      top: 20px; 
      left: 50%; 
      transform: translateX(-50%); 
      background: #7DDE4A; 
      color: white; 
      padding: 12px 20px; 
      border-radius: 8px; 
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 90%;
      text-align: center;
      animation: slideDown 0.3s ease-out;
    `;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // Supprimer automatiquement après 4 secondes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
          if (style.parentNode) {
            document.head.removeChild(style);
          }
        }, 300);
      }
    }, 4000);
    
    // Masquer le banner après affichage du toast
    setForceShow(false);
  };

  const handleDismiss = () => {
    setForceShow(false);
    dismissBanner();
    
    // Masquer pour toute la session
    sessionStorage.setItem('ecolojia-pwa-dismissed', 'true');
  };

  // Vérifier si déjà fermé cette session
  useEffect(() => {
    if (sessionStorage.getItem('ecolojia-pwa-dismissed')) {
      setForceShow(false);
    }
  }, []);

  return (
    <>
      {/* Banner mobile SEULEMENT - NON BLOQUANT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-leaf/20 shadow-lg z-40 animate-fade-in-up block md:hidden">
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
                disabled={isInstalling}
                className="bg-eco-leaf text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-eco-leaf/90 transition-colors disabled:opacity-50"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Install...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Installer</span>
                  </>
                )}
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
    </>
  );
};

export default PWAInstallBanner;