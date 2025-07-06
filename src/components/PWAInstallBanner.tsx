import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

// Composant Icône ECOLOJIA avec feuille inclinée exacte
const EcolojiaIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 56, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id={`backgroundGradient-${size}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: '#7DDE4A', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#6BCF3A', stopOpacity: 1 }} />
      </radialGradient>
      
      <linearGradient id={`leafGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.95 }} />
        <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
      </linearGradient>
      
      <filter id={`leafShadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#1E3D2B" floodOpacity="0.15"/>
      </filter>
    </defs>
    
    {/* Fond circulaire principal */}
    <circle cx="256" cy="256" r="240" fill={`url(#backgroundGradient-${size})`} stroke="#5ABE29" strokeWidth="4"/>
    
    {/* Feuille ECOLOJIA EXACTE - Logo authentique */}
    <g transform="translate(256, 256) scale(2.2)" filter={`url(#leafShadow-${size})`}>
      {/* Corps de la feuille stylisée exacte */}
      <path d="M -25 -50
               C -30 -55, -20 -58, -10 -55
               C 5 -50, 20 -40, 30 -25
               C 38 -10, 42 5, 40 22
               C 38 35, 32 45, 20 50
               C 8 52, -5 50, -15 45
               C -25 38, -30 28, -32 15
               C -34 2, -30 -12, -25 -25
               C -22 -35, -23 -42, -25 -50 Z" 
            fill={`url(#leafGradient-${size})`} 
            stroke="none"/>
      
      {/* Ligne centrale stylisée (comme votre logo) */}
      <path d="M -18 -45 
               C -8 -35, 8 -20, 20 -5
               C 30 8, 35 25, 30 42" 
            stroke="rgba(255,255,255,0.7)" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            fill="none"/>
    </g>
    
    {/* Points décoratifs subtils */}
    <circle cx="150" cy="150" r="6" fill="rgba(255,255,255,0.2)"/>
    <circle cx="370" cy="180" r="4" fill="rgba(255,255,255,0.15)"/>
    <circle cx="180" cy="370" r="3" fill="rgba(255,255,255,0.1)"/>
  </svg>
);

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PRIORITÉ 1: Détecter mode standalone (app installée et lancée depuis icône)
    const checkStandalone = () => {
      // Méthode 1: CSS media query (Android Chrome, Desktop)
      const isStandaloneCSS = window.matchMedia('(display-mode: standalone)').matches;
      
      // Méthode 2: Navigator standalone (iOS Safari)
      const isStandaloneNav = (window.navigator as any).standalone === true;
      
      // Méthode 3: Android app référrer
      const isAndroidApp = document.referrer.includes('android-app://');
      
      const standalone = isStandaloneCSS || isStandaloneNav || isAndroidApp;
      
      console.log('🔍 Détection Standalone:', {
        isStandaloneCSS,
        isStandaloneNav,
        isAndroidApp,
        finalResult: standalone
      });
      
      setIsStandalone(standalone);
      
      // Si standalone, JAMAIS afficher le banner
      if (standalone) {
        console.log('📱 Mode Standalone détecté - Banner définitivement désactivé');
        setShowBanner(false);
        return false; // Ne pas continuer l'évaluation
      }
      
      return true; // Continuer l'évaluation normale
    };

    // Vérifier standalone en premier
    const shouldContinue = checkStandalone();
    
    // Si pas standalone, appliquer logique normale
    if (shouldContinue) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const dismissed = sessionStorage.getItem('ecolojia-banner-dismissed');

      console.log('📱 Conditions banner:', {
        isMobile,
        dismissed,
        isStandalone
      });

      if (isMobile && !dismissed) {
        const timer = setTimeout(() => {
          // Double vérification: pas standalone
          if (!isStandalone) {
            console.log('⏰ Timer mobile - Affichage banner (mode navigateur)');
            setShowBanner(true);
          } else {
            console.log('⏰ Timer annulé - Mode standalone détecté');
          }
        }, 3000);

        return () => clearTimeout(timer);
      }
    }

    // Écouter les changements de display-mode (dynamique)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      console.log('🔄 Display mode changé:', mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsStandalone(true);
        setShowBanner(false);
      }
    };
    
    mediaQuery.addListener(handleDisplayModeChange);
    return () => mediaQuery.removeListener(handleDisplayModeChange);
  }, []);

  const handleInstall = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    console.log('🔧 Installation PWA demandée:', { isAndroid, isIOS });
    
    if (isAndroid) {
      alert(`📱 Installation Android :

1️⃣ Appuyez sur le menu ⋮ (3 points) en haut
2️⃣ Cherchez "Installer l'application" 
3️⃣ Confirmez l'installation

💡 L'app apparaîtra sur votre écran d'accueil !`);
    } else if (isIOS) {
      alert(`🍎 Installation iOS :

1️⃣ Appuyez sur Partager ⎁ en bas
2️⃣ Sélectionnez "Sur l'écran d'accueil"
3️⃣ Appuyez sur "Ajouter"

💡 L'icône ECOLOJIA apparaîtra !`);
    } else {
      alert("💻 Pour installer l'application, utilisez le menu de votre navigateur.");
    }
  };

  const handleDismiss = () => {
    console.log('❌ Banner fermé par utilisateur');
    setShowBanner(false);
    sessionStorage.setItem('ecolojia-banner-dismissed', 'true');
  };

  const resetBanner = () => {
    console.log('🔄 Reset banner PWA');
    sessionStorage.removeItem('ecolojia-banner-dismissed');
    if (!isStandalone) {
      setShowBanner(true);
    } else {
      console.log('⚠️ Reset ignoré - Mode standalone actif');
    }
  };

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // RÈGLE CRITIQUE: Ne jamais afficher en mode standalone
  if (isStandalone) {
    console.log('🚫 Rendu bloqué - Mode standalone');
    return null;
  }

  return (
    <>
      {/* Debug Info - Retirer en production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,255,0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 9999,
        maxWidth: '160px',
        lineHeight: '1.2'
      }}>
        <div>Standalone: {isStandalone ? '✅' : '❌'}</div>
        <div>Banner: {showBanner ? '✅' : '❌'}</div>
        <div>Mobile: {isMobile ? '✅' : '❌'}</div>
      </div>

      {showBanner && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-eco-leaf shadow-lg z-40 animate-slide-up">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                {/* Icône ECOLOJIA avec feuille inclinée */}
                <div className="flex-shrink-0">
                  <EcolojiaIcon size={56} className="drop-shadow-md" />
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

      {!showBanner && isMobile && !isStandalone && (
        <div className="fixed bottom-6 left-4 z-50 md:hidden">
          <button
            onClick={resetBanner}
            className="drop-shadow-lg hover:scale-105 transition-transform"
            title="Réafficher banner PWA"
          >
            <EcolojiaIcon size={48} />
          </button>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;