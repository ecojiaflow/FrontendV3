import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Zap } from 'lucide-react';
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
 * Scanner avec détection GARANTIE + UI améliorée
 * ----------------------------------------------
 * • Retour à la méthode de détection qui fonctionnait
 * • UI moderne avec cadre transparent
 * • Optimisations visuelles uniquement
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [needManualStart, setNeedManualStart] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);

  /* ZXing reader - configuration originale qui marchait */
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

  /* Start camera - méthode originale */
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

  /* Scanning loop - méthode originale qui marchait */
  const startScanningLoop = () => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    scanInterval.current = setInterval(() => scanFrame(), 500);
  };

  /* Try decoding - EXACTEMENT comme l'original */
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

  /* Capture & scan - EXACTEMENT comme l'original */
  const scanFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const code = await tryDecodeRotations(ctx, canvas.width, canvas.height);
    if (code) handleSuccess(code);
  };

  /* Success avec animation */
  const handleSuccess = (code: string) => {
    setScanAnimation(true);
    setTimeout(() => {
      setScanAnimation(false);
      stopAll();
      onScanSuccess(code);
    }, 500);
  };

  /* Toggle torche */
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    
    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torch }]
        });
        setTorch(!torch);
      } catch (e) {
        console.error('Erreur torche:', e);
      }
    }
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
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header moderne */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-white" />
          <h2 className="text-white font-semibold">Scanner de codes-barres</h2>
        </div>
        <button
          onClick={() => {
            stopAll();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Zone de scan */}
      <div className="flex-1 relative overflow-hidden">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          muted 
          playsInline 
        />

        {/* Overlay moderne avec cadre TRANSPARENT */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Zones sombres légères autour */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-1/3 bottom-1/3 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />
            <div className="absolute top-1/3 bottom-1/3 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent" />
          </div>
          
          {/* Cadre de scan */}
          <div className="relative">
            <div 
              className={`w-80 h-24 border-2 rounded-xl transition-all duration-300 ${
                scanAnimation 
                  ? 'border-green-400 shadow-lg shadow-green-400/50 scale-105' 
                  : 'border-white/70'
              }`}
            />
            
            {/* Coins dynamiques */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-xl" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-xl" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-xl" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-xl" />
            
            {/* Ligne de scan */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                style={{
                  top: '50%',
                  animation: scanAnimation ? 'none' : 'scan 2s ease-in-out infinite'
                }}
              />
            </div>
            
            {/* Animation de succès */}
            {scanAnimation && (
              <div className="absolute inset-0 border-4 border-green-400 rounded-xl animate-ping" />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 right-0 px-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
            <p className="text-white font-medium mb-1">
              Centrez le code-barres dans le cadre
            </p>
            <p className="text-white/70 text-sm">
              Le scan se fait automatiquement
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 backdrop-blur-sm">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleTorch}
            className={`p-4 rounded-full transition-all ${
              torch 
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Zap className="h-6 w-6" />
          </button>
          
          {needManualStart && (
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-full bg-eco-leaf text-white font-semibold shadow-lg shadow-eco-leaf/30"
            >
              🎥 Autoriser la caméra
            </button>
          )}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="absolute inset-x-4 top-20 bg-red-500/90 backdrop-blur-sm rounded-2xl p-4 border border-red-400">
          <p className="text-white font-medium text-center">{error}</p>
        </div>
      )}

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;