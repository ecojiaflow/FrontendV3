import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Leaf, AlertCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();
  const [forceShow, setForceShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [installResult, setInstallResult] = useState('');

  // Debug détaillé
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    console.log('🔍 PWA Debug détaillé:', {
      isMobile,
      isIOS,
      isAndroid,
      isStandalone,
      showInstallBanner,
      hasBeforeInstallPrompt: 'onbeforeinstallprompt' in window,
      userAgent: navigator.userAgent
    });
    
    setDebugInfo(`Mobile: ${isMobile}, iOS: ${isIOS}, Android: ${isAndroid}, Standalone: ${isStandalone}`);
  }, [isStandalone, showInstallBanner]);

  // Force affichage
  useEffect(() => {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !isStandalone) {
      const timer = setTimeout(() => {
        console.log('⏰ Timer déclenché - Banner forcé');
        setForceShow(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  const handleInstall = async () => {
    console.log('🔧 === DÉBUT INSTALLATION PWA ===');
    setIsInstalling(true);
    setInstallResult('Installation en cours...');
    
    try {
      // 1. Vérifier les conditions PWA
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const hasPromptAPI = 'onbeforeinstallprompt' in window;
      
      console.log('📱 Conditions:', { isIOS, isAndroid, hasPromptAPI });
      
      if (isIOS) {
        console.log('🍎 iOS détecté - Installation manuelle uniquement');
        setInstallResult('iOS: Installation manuelle requise');
        showIOSInstructions();
        return;
      }
      
      // 2. Essayer l'API native
      console.log('🚀 Tentative API native...');
      const success = await triggerInstall();
      console.log('📱 Résultat API native:', success);
      
      if (success) {
        console.log('✅ Installation PWA native réussie');
        setInstallResult('✅ Installation réussie !');
        setForceShow(false);
      } else {
        console.log('❌ API native échouée - Fallback manuel');
        setInstallResult('❌ API échouée - Instructions manuelles');
        showManualInstructions();
      }
      
    } catch (error) {
      console.error('❌ Erreur installation:', error);
      setInstallResult(`❌ Erreur: ${error.message}`);
      showManualInstructions();
    } finally {
      setIsInstalling(false);
      console.log('🔧 === FIN INSTALLATION PWA ===');
    }
  };

  const showIOSInstructions = () => {
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        background: white; 
        border: 2px solid #7DDE4A;
        border-radius: 12px; 
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        max-width: 320px;
        text-align: center;
      ">
        <h3 style="margin: 0 0 15px 0; color: #1E3D2B;">📱 Installation iOS</h3>
        <div style="margin: 15px 0; color: #666; line-height: 1.4;">
          <p><strong>1.</strong> Touchez <span style="border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px;">⎍</span> (Partager)</p>
          <p><strong>2.</strong> Sélectionnez "Sur l'écran d'accueil"</p>
          <p><strong>3.</strong> Touchez "Ajouter"</p>
        </div>
        <button onclick="this.closest('div').remove()" style="
          background: #7DDE4A; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 8px; 
          cursor: pointer;
          font-weight: 500;
        ">Compris</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 10000);
  };

  const showManualInstructions = () => {
    const isAndroid = /Android/.test(navigator.userAgent);
    
    const message = isAndroid 
      ? '💡 Menu Chrome (⋮) → "Installer l\'application"'
      : '💡 Barre d\'adresse → Icône installation';

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
        toast.remove();
      }
    }, 5000);
  };

  const handleDismiss = () => {
    console.log('❌ Banner fermé par utilisateur');
    setForceShow(false);
    dismissBanner();
    sessionStorage.setItem('ecolojia-pwa-dismissed', 'true');
  };

  // Vérifier sessionStorage
  useEffect(() => {
    const dismissed = sessionStorage.getItem('ecolojia-pwa-dismissed');
    if (dismissed) {
      setForceShow(false);
    }
  }, []);

  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shouldShow = isMobile && (showInstallBanner || forceShow) && !isStandalone;

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Debug info détaillé */}
      <div className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded text-xs z-50 md:hidden max-w-xs">
        <div>Debug: {debugInfo}</div>
        {installResult && <div className="mt-1 text-yellow-200">Résultat: {installResult}</div>}
      </div>

      {/* Banner PWA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-leaf/20 shadow-lg z-40 block md:hidden">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-eco-leaf rounded-xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-eco-text text-sm">
                  Installer ECOLOJIA
                </h3>
                <p className="text-xs text-eco-text/70 line-clamp-1">
                  Scanner + mode hors ligne
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-eco-leaf text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-eco-leaf/90 transition-colors disabled:opacity-50"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Test...</span>
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