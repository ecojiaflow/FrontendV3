import React, { useState, useEffect } from 'react';
import { Download, X, Leaf, Smartphone, ArrowRight, Menu, MoreVertical } from 'lucide-react';

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Détection mobile
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
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isIOS) {
      setShowGuide(true);
    } else if (isAndroid) {
      setShowGuide(true);
    } else {
      // Desktop - instructions simples
      alert(`💻 Installation Desktop

1. Regardez la barre d'adresse → icône "Installer" ⬇️
2. OU Menu navigateur → "Installer l'application"

ECOLOJIA sera accessible depuis votre bureau !`);
      setShowBanner(false);
    }
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
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <>
      {/* Guide d'installation détaillé */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-eco-text flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-eco-leaf" />
                  {isIOS ? 'Installation iPhone' : 'Installation Android'}
                </h2>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isAndroid ? (
                // Guide Android détaillé
                <div className="space-y-4">
                  <div className="bg-eco-leaf/10 p-4 rounded-xl border border-eco-leaf/20">
                    <h3 className="font-bold text-eco-text mb-3 flex items-center gap-2">
                      <MoreVertical className="w-5 h-5" />
                      MÉTHODE 1 : Menu Chrome
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="font-medium">Touchez les 3 points ⋮ en haut à droite de Chrome</p>
                          <p className="text-gray-600 text-xs">Dans la barre d'outils de Chrome</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="font-medium">Cherchez "Installer l'application" ou "Ajouter à l'écran d'accueil"</p>
                          <p className="text-gray-600 text-xs">Dans la liste du menu qui s'ouvre</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="font-medium">Touchez pour installer !</p>
                          <p className="text-green-600 text-xs font-medium">✅ ECOLOJIA apparaîtra sur votre écran d'accueil</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3">🔍 MÉTHODE 2 : Barre d'adresse</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>• Regardez dans la barre d'adresse de Chrome</p>
                      <p>• Cherchez une icône ⬇️ ou ➕</p>
                      <p>• Touchez cette icône pour installer</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <h3 className="font-bold text-orange-800 mb-2">❓ Vous ne trouvez pas ?</h3>
                    <div className="space-y-2 text-sm text-orange-700">
                      <p>• <strong>Vérifiez votre version Chrome</strong> (doit être récente)</p>
                      <p>• <strong>Redémarrez Chrome</strong> et revenez sur le site</p>
                      <p>• <strong>Alternative :</strong> Ajoutez aux Favoris, puis "Ajouter à l'écran d'accueil"</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Guide iOS détaillé
                <div className="space-y-4">
                  <div className="bg-eco-leaf/10 p-4 rounded-xl border border-eco-leaf/20">
                    <h3 className="font-bold text-eco-text mb-3">📱 Étapes Safari :</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <div>
                          <p className="font-medium">Touchez le bouton PARTAGER ⎍</p>
                          <p className="text-gray-600 text-xs">En bas au milieu de Safari (carré avec flèche vers le haut)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <div>
                          <p className="font-medium">Faites défiler vers le bas</p>
                          <p className="text-gray-600 text-xs">Dans la liste d'options qui s'ouvre</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <div>
                          <p className="font-medium">Touchez "Sur l'écran d'accueil"</p>
                          <p className="text-gray-600 text-xs">Icône avec un + et un carré</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-eco-leaf text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <div>
                          <p className="font-medium">Touchez "Ajouter"</p>
                          <p className="text-green-600 text-xs font-medium">✅ ECOLOJIA apparaîtra sur votre écran d'accueil !</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-eco-leaf" />
                    <span className="font-bold text-eco-text">Résultat final :</span>
                  </div>
                  <p className="text-sm text-green-700">
                    🎉 <strong>ECOLOJIA</strong> sera accessible depuis votre écran d'accueil comme une vraie application !
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Scanner + mode hors ligne + accès rapide 🌱
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowGuide(false);
                  setShowBanner(false);
                }}
                className="w-full mt-4 bg-eco-leaf text-white py-3 rounded-xl font-medium hover:bg-eco-leaf/90 transition-colors"
              >
                J'ai compris !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner PWA original */}
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
                    🌱 Scanner + accès rapide écran d'accueil
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-eco-leaf to-green-500 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 hover:scale-105 transition-transform shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>GUIDE</span>
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

      {/* Debug corner */}
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