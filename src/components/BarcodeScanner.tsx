import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Scanner fiable + logs :
 * • Caméra auto‑start, fallback bouton
 * • Hints : EAN‑13, EAN‑8, UPC‑A, CODE‑128
 * • Débug : log chaque tentative et erreur
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [needManualStart, setNeedManualStart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // hints ZXing : formats + tryHarder
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.CODE_128,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);

  /** Demarre le decode continu */
  const startScan = async () => {
    setError(null);
    setNeedManualStart(false);

    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader(hints);
    }

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            console.log('🎯 Détection code', result.getText());
            handleSuccess(result.getText());
          }
          if (err && !(err instanceof DOMException)) {
            // DOMException fréquente quand pas de code dans la frame → on ignore
            console.log('⏳ Frame sans code');
          }
        },
        { video: { facingMode: { ideal: 'environment' } } },
      );
      setIsScanning(true);
    } catch (e: any) {
      console.warn('❌ getUserMedia error', e);
      setNeedManualStart(true);
      setError('Autorisez la caméra pour scanner.');
    }
  };

  const stopScan = () => {
    codeReaderRef.current?.reset();
    setIsScanning(false);
  };

  const handleSuccess = (code: string) => {
    stopScan();
    onScanSuccess(code);
  };

  // Auto‑start à l'ouverture
  useEffect(() => {
    if (isOpen) startScan();
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      </div>

      {needManualStart && (
        <button
          onClick={startScan}
          className="mt-6 px-6 py-3 rounded-lg bg-eco-leaf text-white font-semibold"
        >
          🎥 Autoriser la caméra
        </button>
      )}

      {error && <p className="mt-4 text-red-500 text-sm text-center max-w-xs">{error}</p>}
    </div>
  );
};

export default BarcodeScanner;
