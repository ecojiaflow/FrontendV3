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
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Détecter si PWA est déjà installée
    const checkInstallation = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    checkInstallation();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      setInstallPrompt({
        prompt: () => promptEvent.prompt(),
        userChoice: promptEvent.userChoice
      });
      
      // Afficher le banner après 3 secondes si pas installé
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstallBanner(false);
      
      // Analytics : Installation PWA
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'install_success'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  // Déclencher l'installation
  const triggerInstall = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
        
        // Analytics : Choix utilisateur
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_accepted', {
            event_category: 'PWA',
            event_label: 'user_accepted'
          });
        }
        
        return true;
      } else {
        // Analytics : Refus utilisateur
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_dismissed', {
            event_category: 'PWA',
            event_label: 'user_dismissed'
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur installation PWA:', error);
    }

    setInstallPrompt(null);
    return false;
  };

  // Masquer le banner manuellement
  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('ecolojia_install_dismissed', Date.now().toString());
  };

  // Vérifier si le banner a été masqué récemment
  const wasBannerDismissedRecently = () => {
    const dismissed = localStorage.getItem('ecolojia_install_dismissed');
    if (!dismissed) return false;
    
    const dismissedTime = parseInt(dismissed);
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    return daysSinceDismissal < 7; // Ne pas re-afficher pendant 7 jours
  };

  return {
    installPrompt: !!installPrompt,
    isInstalled,
    isStandalone,
    showInstallBanner: showInstallBanner && !wasBannerDismissedRecently(),
    triggerInstall,
    dismissBanner
  };
};