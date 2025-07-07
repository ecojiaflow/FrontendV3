import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

declare global {
  interface Window {
    ZXing: any;
  }
}

/**
 * BarcodeScanner – version stable et minimale
 * -------------------------------------------------
 * • Flux vidéo lancé uniquement après clic utilisateur → permissions fiables
 * • Utilise ZXing decodeFromVideoDevice (gère lui‑même getUserMedia)
 * • Réinitialise proprement la caméra à la fermeture
 * • Interface ultra‑simple (Start / Close)
 * -------------------------------------------------
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<any>(null);
  const [isZXingLoaded, setIsZXingLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Charger ZXing dynamiquement quand le scanner est ouvert */
  useEffect(() => {
    if (!isOpen) return;

    const loadZXing = () => {
      if (window.ZXing) {
        setIsZXingLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/library@latest/umd/index.min.js';
      script.onload = () => setIsZXingLoaded(true);
      script.onerror = () => setError('Erreur de chargement du moteur ZXing');
      document.head.appendChild(script);
    };

    loadZXing();
  }, [isOpen]);

  /* Fonction qui démarre le scan après action utilisateur */
  const startScan = async () => {
    if (!isZXingLoaded) return;
    setError(null);

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
      }
      // Utiliser la caméra arrière si disponible
      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result: any, err: any) => {
          if (result) {
            handleSuccess(result.getText());
          }
        },
        {
          video: { facingMode: { ideal: 'environment' } }
        }
      );
      setIsScanning(true);
    } catch (e) {
      setError('Impossible d\'accéder à la caméra.');
    }
  };

  /* Arrêter le scan et libérer la caméra */
  const stopScan = () => {
    try {
      codeReaderRef.current?.reset();
    } catch {
      /* noop */
    }
    setIsScanning(false);
  };

  /* Nettoyage à la fermeture du composant */
  useEffect(() => {
    if (!isOpen) stopScan();
    return () => stopScan();
  }, [isOpen]);

  const handleSuccess = (code: string) => {
    stopScan();
    onScanSuccess(code);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur flex flex-col items-center justify-center z-50 p-4">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => {
            stopScan();
            onClose();
          }}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Zone vidéo */}
      <div className="w-full max-w-md aspect-[9/16] bg-black relative rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

        {/* Overlay guide */}
        {isScanning && (
          <div className="absolute inset-0 border-4 border-eco-leaf rounded-xl pointer-events-none" />
        )}
      </div>

      {/* Boutons */}
      {!isScanning && (
        <button
          onClick={startScan}
          disabled={!isZXingLoaded}
          className="mt-6 px-6 py-3 rounded-lg font-semibold text-white bg-eco-leaf disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isZXingLoaded ? '🎥 Lancer la caméra' : '⏳ Chargement moteur…'}
        </button>
      )}

      {/* Erreur */}
      {error && (
        <p className="mt-4 text-red-500 text-sm max-w-xs text-center">{error}</p>
      )}
    </div>
  );
};

export default BarcodeScanner;
