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
 * Scanner fiable + cadre compact
 * --------------------------------------------------
 * • Auto‑start + fallback bouton
 * • Hints : EAN‑13, EAN‑8, UPC‑A, CODE‑128
 * • Cadre de visée ≈ 60% largeur vidéo, ratio 4:1 (look and feel apps pro)
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [needManualStart, setNeedManualStart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ZXing hints */
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.CODE_128,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);

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
        },
        { video: { facingMode: { ideal: 'environment' } } },
      );
      if (videoRef.current && videoRef.current.paused) await videoRef.current.play();
      setIsScanning(true);
    } catch (e) {
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

      {/* Video */}
      <div className="w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Cadre de visée */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/5 max-w-xs aspect-[4/1] border-4 border-eco-leaf rounded-xl relative">
              {/* coins */}
              <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-eco-leaf" />
              <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-eco-leaf" />
              <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-eco-leaf" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-eco-leaf" />
            </div>
          </div>
        )}
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
