import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter si PWA est déjà installée
    const checkInstallation = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      
      console.log('📱 PWA installée ?', standalone);
      setIsStandalone(standalone);
      
      if (!standalone) {
        setShowInstallBanner(true);
      }
    };

    checkInstallation();

    // Écouter l'événement beforeinstallprompt NATIF
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt event reçu NATIF');
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallBanner(true);
    };

    // Écouter l'événement custom depuis index.html
    const handleCustomInstallEvent = (e: CustomEvent) => {
      console.log('🎯 pwa-install-available event reçu CUSTOM');
      setInstallPrompt(e.detail.prompt);
      setShowInstallBanner(true);
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      console.log('🎉 PWA installée avec succès!');
      setInstallPrompt(null);
      setShowInstallBanner(false);
      setIsStandalone(true);
    };

    // Ajouter les listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-install-available', handleCustomInstallEvent as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback : Si pas d'événement après 5 secondes, forcer l'affichage
    const fallbackTimer = setTimeout(() => {
      if (!installPrompt && !isStandalone) {
        console.log('⚡ Fallback : Pas d\'événement beforeinstallprompt détecté');
        setShowInstallBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-available', handleCustomInstallEvent as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, [installPrompt, isStandalone]);

  // Déclencher l'installation avec debug
  const triggerInstall = async () => {
    console.log('🔧 triggerInstall appelé, installPrompt:', !!installPrompt);
    
    if (!installPrompt) {
      console.log('❌ Pas de prompt d\'installation disponible');
      return false;
    }

    try {
      console.log('🚀 Déclenchement du prompt d\'installation...');
      await installPrompt.prompt();
      
      const choiceResult = await installPrompt.userChoice;
      console.log('👤 Choix utilisateur:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Installation acceptée par l\'utilisateur');
        setInstallPrompt(null);
        setShowInstallBanner(false);
        return true;
      } else {
        console.log('❌ Installation refusée par l\'utilisateur');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'installation:', error);
      return false;
    }
  };

  const dismissBanner = () => {
    console.log('🙈 Banner PWA fermé');
    setShowInstallBanner(false);
  };

  return {
    installPrompt,
    showInstallBanner,
    isStandalone,
    triggerInstall,
    dismissBanner
  };
};