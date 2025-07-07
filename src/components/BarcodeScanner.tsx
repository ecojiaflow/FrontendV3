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
 * Scanner complet – détection multi‑rotation (0°, 90°, 180°, 270°)
 * ----------------------------------------------------------------
 * • Démarre caméra via getUserMedia (caméra arrière par défaut).
 * • Capture une frame toutes 500 ms, tente la lecture à 4 rotations.
 * • Formats : EAN-13, EAN-8, UPC-A, CODE‑128.
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [needManualStart, setNeedManualStart] = useState(false);

  /* ZXing reader avec hints */
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
      hints.set(DecodeHintType.ALSO_INVERTED, true);
      readerRef.current = new BrowserMultiFormatReader(hints);
    }
    return readerRef.current;
  };

  /* Start camera + scanning */
  const startCamera = async () => {
    setError(null);
    setNeedManualStart(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        startScanningLoop();
      }
    } catch (e) {
      setError('Accès caméra refusé.');
      setNeedManualStart(true);
    }
  };

  /* Scanning loop */
  const startScanningLoop = () => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    scanInterval.current = setInterval(() => scanFrame(), 500);
  };

  /* Try decoding at 0/90/180/270 deg */
  const tryDecodeRotations = async (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const reader = getReader();
    const rotations = [0, 90, 180, 270];

    for (const deg of rotations) {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.translate(w / 2, h / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(videoRef.current as HTMLVideoElement, -w / 2, -h / 2, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      ctx.restore();
      try {
        const result = await reader.decodeFromImageData(imageData);
        if (result?.text) return result.text;
      } catch {/* ignore */}
    }
    return null;
  };

  /* Capture & scan */
  const scanFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return; // pas assez de données

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const code = await tryDecodeRotations(ctx, canvas.width, canvas.height);
    if (code) handleSuccess(code);
  };

  /* Success */
  const handleSuccess = (code: string) => {
    stopAll();
    onScanSuccess(code);
  };

  /* Stop camera & loops */
  const stopAll = () => {
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  /* Effects */
  useEffect(() => {
    if (isOpen) startCamera();
    return () => stopAll();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
      <button
        onClick={() => {
          stopAll();
          onClose();
        }}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

        {/* Cadre transparent avec bordures visibles uniquement */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11/12 max-w-md aspect-[3/1] border-4 border-white/80 rounded-xl relative">
            {/* Coins renforcés pour meilleure visibilité */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-white rounded-br-lg" />
          </div>
        </div>

        {/* Instructions en bas */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/70 rounded-lg p-3 text-center">
            <p className="text-white text-sm font-medium">
              Centrez le code-barres dans le cadre
            </p>
          </div>
        </div>
      </div>

      {needManualStart && (
        <button
          onClick={startCamera}
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