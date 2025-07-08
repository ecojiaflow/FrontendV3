import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCw } from 'lucide-react';

// Types pour html5-qrcode
declare global {
  interface Window {
    Html5QrcodeScanner: any;
    Html5Qrcode: any;
  }
}

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Scanner avec gestion manuelle des permissions caméra
 * ---------------------------------------------------
 * • Demande explicite des permissions
 * • Fallback en cas de refus
 * • UI claire pour guider l'utilisateur
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const scannerRef = useRef<any>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  /* Charger la bibliothèque html5-qrcode */
  const loadHtml5QrCode = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Html5QrcodeScanner) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
      script.onload = () => {
        console.log('✅ html5-qrcode chargé');
        resolve(true);
      };
      script.onerror = () => {
        console.error('❌ Échec chargement html5-qrcode');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  };

  /* Demander permissions caméra explicitement */
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      console.log('📷 Demande permission caméra...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      
      console.log('✅ Permission accordée');
      
      // Arrêter le stream temporaire
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('❌ Permission refusée:', error);
      setPermissionDenied(true);
      return false;
    }
  };

  /* Initialiser le scanner */
  const initializeScanner = async () => {
    if (!elementRef.current) return;

    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // 1. Charger la bibliothèque
      const loaded = await loadHtml5QrCode();
      if (!loaded) {
        throw new Error('Impossible de charger la bibliothèque');
      }

      // 2. Attendre un peu pour que la page soit prête
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Configuration simplifiée
      const config = {
        fps: 10,
        qrbox: { width: 300, height: 100 },
        aspectRatio: 3.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
        supportedScanTypes: [window.Html5QrcodeScanType?.SCAN_TYPE_CAMERA]
      };

      // 4. Callbacks
      const onScanSuccessCallback = (decodedText: string, decodedResult: any) => {
        console.log('🎯 Code détecté:', decodedText);
        setScanCount(prev => prev + 1);
        
        // Arrêter le scanner
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }
        
        onScanSuccess(decodedText);
      };

      const onScanErrorCallback = (errorMessage: string) => {
        // Ignorer les erreurs normales de scan
      };

      // 5. Nettoyer l'élément avant de créer le scanner
      const element = document.getElementById('qr-reader');
      if (element) {
        element.innerHTML = '';
      }

      // 6. Créer le scanner
      scannerRef.current = new window.Html5QrcodeScanner(
        'qr-reader',
        config,
        false // verbose = false
      );

      // 7. Rendre le scanner
      await scannerRef.current.render(onScanSuccessCallback, onScanErrorCallback);
      
      setCameraReady(true);
      setIsLoading(false);
      
      console.log('🚀 Scanner rendu avec succès');

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      setError(`Erreur scanner: ${error.message || 'Inconnue'}`);
      setIsLoading(false);
    }
  };

  /* Arrêter le scanner */
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error: any) => {
        console.error('Erreur arrêt scanner:', error);
      });
      scannerRef.current = null;
    }
    setCameraReady(false);
    setScanCount(0);
  };

  /* Redémarrer */
  const restartScanner = () => {
    stopScanner();
    setError(null);
    setPermissionDenied(false);
    setTimeout(() => {
      initializeScanner();
    }, 1000);
  };

  /* Gérer les permissions manuellement */
  const handleManualPermission = async () => {
    try {
      // Ouvrir les paramètres du navigateur pour les permissions
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'denied') {
          alert('Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur, puis rafraîchir la page.');
          return;
        }
      }
      
      restartScanner();
    } catch (error) {
      console.error('Erreur permissions:', error);
      restartScanner();
    }
  };

  /* Effects */
  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-white" />
          <div>
            <h2 className="text-white font-semibold">Scanner Professionnel</h2>
            <p className="text-white/60 text-xs">
              {isLoading ? 'Initialisation...' :
               permissionDenied ? 'Permission requise' :
               cameraReady ? `Détections: ${scanCount}` : 
               'En attente'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Zone de scan */}
      <div className="flex-1 relative">
        {/* Container pour html5-qrcode */}
        <div 
          id="qr-reader" 
          ref={elementRef}
          className="w-full h-full"
        />

        {/* Loading avec plus de détails */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-leaf mx-auto mb-4" />
              <p className="font-semibold mb-2">Chargement du scanner...</p>
              <p className="text-sm text-white/70">Veuillez patienter</p>
            </div>
          </div>
        )}

        {/* Message si le scanner ne s'affiche pas */}
        {!isLoading && !cameraReady && !permissionDenied && !error && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
            <div className="text-white text-center">
              <Camera className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Scanner en cours de chargement...</p>
              <p className="text-white/70 mb-4">Si rien ne s'affiche, essayez de redémarrer</p>
              <button
                onClick={restartScanner}
                className="px-6 py-3 bg-eco-leaf text-white rounded-lg font-medium"
              >
                Redémarrer le scanner
              </button>
            </div>
          </div>
        )}

        {/* Permission denied */}
        {permissionDenied && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
            <div className="text-white text-center max-w-md">
              <Camera className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Accès caméra requis</h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                Pour scanner les codes-barres, nous avons besoin d'accéder à votre caméra. 
                Veuillez autoriser l'accès quand votre navigateur vous le demande.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleManualPermission}
                  className="w-full py-3 bg-eco-leaf text-white rounded-lg font-semibold"
                >
                  Autoriser la caméra
                </button>
                <button
                  onClick={restartScanner}
                  className="w-full py-2 bg-white/10 text-white rounded-lg"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {cameraReady && (
        <div className="p-6 bg-black/90">
          <div className="flex justify-center">
            <button
              onClick={restartScanner}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              <RotateCw className="h-5 w-5" />
              <span>Redémarrer</span>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-white/40 text-xs">
              html5-qrcode • EAN-13, UPC-A, CODE-128, QR
            </p>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 rounded-xl p-4">
          <p className="text-white font-medium text-center mb-3">{error}</p>
          <button
            onClick={restartScanner}
            className="w-full py-2 bg-white/20 rounded-lg text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* CSS améliorés pour html5-qrcode */}
      <style jsx global>{`
        #qr-reader {
          background: black !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        #qr-reader > div {
          border: none !important;
        }
        
        #qr-reader video {
          border-radius: 0 !important;
          object-fit: cover !important;
          width: 100% !important;
          height: auto !important;
        }
        
        #qr-reader__dashboard {
          background: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          margin: 16px !important;
          padding: 20px !important;
        }
        
        #qr-reader__header_message {
          color: white !important;
          font-family: inherit !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-bottom: 16px !important;
          text-align: center !important;
        }
        
        #qr-reader__camera_selection {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
          padding: 12px !important;
          font-size: 14px !important;
          width: 100% !important;
          margin-bottom: 16px !important;
        }
        
        #qr-reader__camera_selection option {
          background: #1f2937 !important;
          color: white !important;
        }
        
        #qr-reader__start_button {
          background: #22c55e !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          padding: 14px 28px !important;
          margin: 8px 4px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        #qr-reader__start_button:hover {
          background: #16a34a !important;
          transform: translateY(-1px) !important;
        }
        
        #qr-reader__stop_button {
          background: #ef4444 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          padding: 14px 28px !important;
          margin: 8px 4px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        #qr-reader__stop_button:hover {
          background: #dc2626 !important;
          transform: translateY(-1px) !important;
        }
        
        #qr-reader__dashboard_section {
          background: transparent !important;
          text-align: center !important;
        }
        
        #qr-reader__dashboard_section_csr {
          text-align: center !important;
        }
        
        #qr-reader__dashboard_section_swaplink {
          color: rgba(255, 255, 255, 0.7) !important;
          text-decoration: underline !important;
          cursor: pointer !important;
          font-size: 14px !important;
          margin-top: 12px !important;
        }
        
        #qr-reader__dashboard_section_swaplink:hover {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;