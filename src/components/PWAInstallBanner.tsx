import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Leaf } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();
  const [forceShow, setForceShow] = useState(false);

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
    
    // Essayer l'API native d'installation
    const success = await triggerInstall();
    
    if (!success) {
      console.log('📱 API installation non disponible, instructions manuelles');
      showManualInstructions();
    } else {
      console.log('✅ Installation PWA réussie');
    }
  };

  const showManualInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = 'Sur Safari :\n1. Touchez le bouton Partager (carré avec flèche)\n2. Faites défiler et touchez "Sur l\'écran d\'accueil"\n3. Touchez "Ajouter"';
    } else if (isAndroid) {
      instructions = 'Sur Chrome :\n1. Touchez le menu (3 points verticaux)\n2. Touchez "Installer l\'application"\n3. Confirmez l\'installation';
    } else {
      instructions = 'Dans votre navigateur :\n1. Cherchez l\'icône d\'installation dans la barre d\'adresse\n2. Ou Menu → "Installer ECOLOJIA"';
    }

    // Utiliser une popup custom au lieu de alert
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; text-align: center;">
          <h3 style="margin: 0 0 20px 0; color: #1E3D2B;">📱 Installer ECOLOJIA</h3>
          <p style="margin: 0 0 20px 0; line-height: 1.5; color: #666;">${instructions}</p>
          <button onclick="this.closest('div').remove()" style="background: #7DDE4A; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Compris</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
  };

  return (
    <>
      {/* Banner mobile SEULEMENT */}
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
    </>
  );
};

export default PWAInstallBanner;