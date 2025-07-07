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
 * BarcodeScanner – version AUTO‑START + fallback bouton
 * --------------------------------------------------
 * • Tente de lancer la caméra immédiatement à l'ouverture (navigation = geste utilisateur)
 * • Si le navigateur refuse (NotAllowedError), affiche un bouton pour relancer manuellement
 * • Utilise decodeFromVideoDevice pour simplifier
 * --------------------------------------------------
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<any>(null);
  const [isZXingLoaded, setIsZXingLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needManualStart, setNeedManualStart] = useState(false);

  /* Charger ZXing */
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

  /* Auto‑start quand ZXing prêt */
  useEffect(() => {
    if (isOpen && isZXingLoaded && !isScanning) {
      startScan().catch(() => {
        // permission refusée → montrer bouton manuel
        setNeedManualStart(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZXingLoaded, isOpen]);

  const startScan = async () => {
    setError(null);
    setNeedManualStart(false);

    if (!codeReaderRef.current) {
      codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
    }
    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result: any) => {
          if (result) {
            handleSuccess(result.getText());
          }
        },
        {
          video: { facingMode: { ideal: 'environment' } },
        }
      );
      // s'assurer que la vidéo joue réellement
      if (videoRef.current && videoRef.current.paused) {
        await videoRef.current.play();
      }
      setIsScanning(true);
    } catch (e: any) {
      codeReaderRef.current?.reset();
      throw e; // sera catché par l'appelant
    }
  };

  const stopScan = () => {
    try {
      codeReaderRef.current?.reset();
    } catch {/* noop */}
    setIsScanning(false);
  };

  const handleSuccess = (code: string) => {
    stopScan();
    onScanSuccess(code);
  };

  useEffect(() => {
    if (!isOpen) stopScan();
    return () => stopScan();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
      {/* Close */}
      <button
        onClick={() => {
          stopScan();
          onClose();
        }}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Video container */}
      <div className="w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      </div>

      {/* Fallback bouton */}
      {needManualStart && (
        <button
          onClick={() => startScan().catch(() => setError('Accès caméra refusé.'))}
          className="mt-6 px-6 py-3 rounded-lg font-semibold text-white bg-eco-leaf"
        >
          🎥 Autoriser la caméra
        </button>
      )}

      {error && <p className="mt-4 text-red-500 text-sm text-center max-w-xs">{error}</p>}
    </div>
  );
};

export default BarcodeScanner;
