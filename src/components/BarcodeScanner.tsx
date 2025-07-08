import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCw, Zap } from 'lucide-react';

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
 * Scanner professionnel avec html5-qrcode - la bibliothèque la plus fiable
 * -----------------------------------------------------------------------
 * • Utilisée par des milliers d'applications en production
 * • Support natif de tous les formats : EAN-13, UPC-A, CODE-128, QR, etc.
 * • Performance optimisée et compatible tous navigateurs
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const scannerRef = useRef<any>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);

  /* Charger la bibliothèque html5-qrcode depuis CDN */
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

  /* Initialiser le scanner */
  const initializeScanner = async () => {
    if (!elementRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const loaded = await loadHtml5QrCode();
      if (!loaded) {
        throw new Error('Impossible de charger la bibliothèque de scan');
      }

      // Configuration optimisée pour les codes-barres
      const config = {
        fps: 10,
        qrbox: {
          width: 300,
          height: 100
        },
        aspectRatio: 3.0,
        supportedScanTypes: [
          window.Html5QrcodeScanType?.SCAN_TYPE_CAMERA
        ],
        formatsToSupport: [
          window.Html5QrcodeSupportedFormats?.EAN_13,
          window.Html5QrcodeSupportedFormats?.EAN_8,
          window.Html5QrcodeSupportedFormats?.UPC_A,
          window.Html5QrcodeSupportedFormats?.UPC_E,
          window.Html5QrcodeSupportedFormats?.CODE_128,
          window.Html5QrcodeSupportedFormats?.CODE_39,
          window.Html5QrcodeSupportedFormats?.QR_CODE
        ]
      };

      // Callback de succès
      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log('🎯 Code détecté:', decodedText);
        setScanCount(prev => prev + 1);
        
        // Arrêter le scanner
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }
        
        // Retourner le résultat
        onScanSuccess(decodedText);
      };

      // Callback d'erreur (optionnel, pour debug)
      const onScanFailure = (error: string) => {
        // Ignorer les erreurs normales de scan
        // console.log('Scan en cours...', error);
      };

      // Créer le scanner
      scannerRef.current = new window.Html5QrcodeScanner(
        'qr-reader',
        config,
        false // verbose
      );

      // Démarrer le scan
      scannerRef.current.render(onScanSuccess, onScanFailure);
      
      setIsLoading(false);
      console.log('🚀 Scanner démarré');

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      setError('Impossible d\'initialiser le scanner');
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
    setScanCount(0);
  };

  /* Redémarrer le scanner */
  const restartScanner = () => {
    stopScanner();
    setTimeout(() => {
      initializeScanner();
    }, 1000);
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
      <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-white" />
          <div>
            <h2 className="text-white font-semibold">Scanner Professionnel</h2>
            <p className="text-white/60 text-xs">
              {isLoading ? 'Initialisation...' : 
               scanCount > 0 ? `Détections: ${scanCount}` : 
               'Prêt'}
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

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p className="font-semibold">Initialisation du scanner...</p>
              <p className="text-sm text-white/70 mt-1">Chargement de la caméra</p>
            </div>
          </div>
        )}

        {/* Instructions overlay */}
        {!isLoading && !error && (
          <div className="absolute bottom-32 left-4 right-4 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-white font-medium mb-1">
                Placez le code-barres dans le cadre
              </p>
              <p className="text-white/70 text-sm">
                Scanner automatique • Tous formats supportés
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/90">
        <div className="flex justify-center space-x-4">
          <button
            onClick={restartScanner}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
          >
            <RotateCw className="h-5 w-5" />
            <span>Redémarrer</span>
          </button>
        </div>
        
        {/* Info technique */}
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            Powered by html5-qrcode • EAN-13, UPC-A, CODE-128, QR
          </p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white font-medium text-center mb-3">{error}</p>
          <button
            onClick={restartScanner}
            className="w-full py-2 bg-white/20 rounded-lg text-white font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* CSS personnalisés pour html5-qrcode */}
      <style jsx global>{`
        #qr-reader {
          background: black !important;
        }
        
        #qr-reader video {
          border-radius: 0 !important;
          object-fit: cover !important;
        }
        
        #qr-reader__dashboard {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }
        
        #qr-reader__dashboard_section {
          background: transparent !important;
        }
        
        #qr-reader__header_message {
          color: white !important;
          font-family: inherit !important;
        }
        
        #qr-reader__camera_selection {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 8px !important;
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
          padding: 12px 24px !important;
        }
        
        #qr-reader__stop_button {
          background: #ef4444 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 12px 24px !important;
        }
        
        .qr-code-full-region {
          background: black !important;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;