import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Leaf } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();
  const [forceShow, setForceShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // Debug : Afficher les informations PWA
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const userAgent = navigator.userAgent;
    
    console.log('🔍 PWA Debug Info:', {
      isMobile,
      isStandalone,
      showInstallBanner,
      userAgent: userAgent.substring(0, 50) + '...'
    });
    
    setDebugInfo(`Mobile: ${isMobile}, Standalone: ${isStandalone}, Banner: ${showInstallBanner}`);
  }, [isStandalone, showInstallBanner]);

  // FORCER l'affichage après 2 secondes sur mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log('📱 PWA Banner - isMobile:', isMobile, 'isStandalone:', isStandalone);
    
    if (isMobile && !isStandalone) {
      const timer = setTimeout(() => {
        console.log('⏰ Timer déclenché - Affichage banner forcé');
        setForceShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  // Vérifier sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem('ecolojia-pwa-dismissed');
    console.log('💾 SessionStorage dismissed:', dismissed);
    if (dismissed) {
      setForceShow(false);
    }
  }, []);

  const handleInstall = async () => {
    console.log('🔧 Clic installation PWA...');
    setIsInstalling(true);
    
    try {
      const success = await triggerInstall();
      console.log('📱 Résultat installation:', success);
      
      if (!success) {
        console.log('📱 API installation non disponible, toast simple');
        showSimpleToast();
      } else {
        console.log('✅ Installation PWA réussie');
        setForceShow(false);
      }
    } catch (error) {
      console.error('❌ Erreur installation:', error);
      showSimpleToast();
    } finally {
      setIsInstalling(false);
    }
  };

  const showSimpleToast = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    let message = '';
    if (isIOS) {
      message = '💡 Safari → Partager → "Sur l\'écran d\'accueil"';
    } else {
      message = '💡 Menu navigateur → "Installer l\'application"';
    }

    // Toast simple NON-BLOQUANT
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
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 4000);
    
    setForceShow(false);
  };

  const handleDismiss = () => {
    console.log('❌ Banner fermé par utilisateur');
    setForceShow(false);
    dismissBanner();
    sessionStorage.setItem('ecolojia-pwa-dismissed', 'true');
  };

  // LOGIQUE AFFICHAGE avec debug
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shouldShow = isMobile && (showInstallBanner || forceShow) && !isStandalone;
  
  console.log('🎯 shouldShow:', shouldShow, {
    isMobile,
    showInstallBanner,
    forceShow,
    isStandalone
  });

  // TOUJOURS afficher en mode debug sur mobile (temporaire)
  const debugMode = true;
  const finalShow = debugMode ? isMobile && !isStandalone : shouldShow;

  if (!finalShow) {
    return (
      <div className="fixed bottom-20 right-4 bg-red-500 text-white p-2 rounded text-xs z-50 md:hidden">
        Debug: {debugInfo}
      </div>
    );
  }

  return (
    <>
      {/* Debug info */}
      <div className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded text-xs z-50 md:hidden">
        Debug: {debugInfo}
      </div>

      {/* Banner PWA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-leaf/20 shadow-lg z-40 block md:hidden">
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