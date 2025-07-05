import React from 'react';
import { Smartphone, Download, X, Leaf } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { showInstallBanner, triggerInstall, dismissBanner, isStandalone } = usePWA();
  const [forceShow, setForceShow] = useState(false);

  // Force l'affichage après 2 secondes pour test
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isStandalone) {
        setForceShow(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isStandalone]);

  // Ne pas afficher si déjà installé
  if (isStandalone) {
    return null;
  }

  // Afficher soit si le hook dit oui, soit si on force pour test
  if (!shouldShow) {
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
                className="p-2