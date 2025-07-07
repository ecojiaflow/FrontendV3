import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
 * Version TEST – détection continue + hints formats
 * -------------------------------------------------
 * • Utilise ZXing decodeFromVideoDevice (caméra arrière)
 * • Scan continu, logs ⏳ Frame sans code puis 🎯 Détection code ...
 * • Formats : EAN‑13, EAN‑8, UPC‑A, CODE‑128
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [needManualStart, setNeedManualStart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Build ZXing reader with hints */
  const getReader = () => {
    if (!readerRef.current) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.CODE_128,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      readerRef.current = new BrowserMultiFormatReader(hints);
    }
    return readerRef.current;
  };

  const startScan = async () => {
    setError(null);
    setNeedManualStart(false);

    try {
      await getReader().decodeFromVideoDevice(
        null,
        videoRef.current!,
        (result, err) => {
          if (result) {
            console.log('🎯 Détection code', result.getText());
            handleSuccess(result.getText());
          } else if (err) {
            console.log('⏳ Frame sans code');
          }
        },
        { video: { facingMode: { ideal: 'environment' } } },
      );
    } catch (e) {
      setNeedManualStart(true);
      setError('Autorisez la caméra pour scanner.');
    }
  };

  const stopScan = () => {
    readerRef.current?.reset();
  };

  const handleSuccess = (code: string) => {
    stopScan();
    onScanSuccess(code);
  };

  /* Auto‑start on open */
  useEffect(() => {
    if (isOpen) startScan();
    return () => stopScan();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
      <button
        onClick={() => {
          stopScan();
          onClose();
        }}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Cadre 80 % largeur, ratio 3:1 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 max-w-sm aspect-[3/1] border-4 border-eco-leaf rounded-xl" />
        </div>
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
