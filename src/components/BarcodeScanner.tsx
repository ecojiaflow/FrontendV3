import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Zap, RotateCcw } from 'lucide-react';
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
 * Scanner optimisé avec overlay transparent et détection simplifiée
 * ---------------------------------------------------------------
 * • Cadre totalement transparent pour visibilité maximale
 * • Détection sur l'ensemble du flux vidéo
 * • Traitement d'image simplifié et optimisé
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanInterval = useRef<NodeJS.Timeout | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScanTime = useRef<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [torch, setTorch] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  /* ZXing reader optimisé */
  const getReader = useCallback(() => {
    if (!readerRef.current) {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.ALSO_INVERTED, true);
      readerRef.current = new BrowserMultiFormatReader(hints);
    }
    return readerRef.current;
  }, []);

  /* Démarrage caméra avec options optimisées */
  const startCamera = useCallback(async () => {
    setError(null);
    setIsScanning(true);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setVideoReady(true);
          startScanningLoop();
        };
      }
    } catch (e) {
      console.error('Erreur caméra:', e);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setIsScanning(false);
    }
  }, []);

  /* Boucle de scan optimisée */
  const startScanningLoop = useCallback(() => {
    if (scanInterval.current) clearInterval(scanInterval.current);
    scanInterval.current = setInterval(() => {
      scanFrame();
    }, 300); // Scan toutes les 300ms pour éviter la surcharge
  }, []);

  /* Capture simplifiée - image complète */
  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !videoReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState < 2) return;

    // Utiliser les dimensions complètes du video
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Redimensionner canvas aux dimensions video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Capturer l'image complète
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Tentative de lecture directe (sans rotation pour commencer)
    await tryDirectDecode(ctx, videoWidth, videoHeight);
  }, [videoReady]);

  /* Décodage direct sans rotation */
  const tryDirectDecode = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const reader = getReader();
    
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const result = await reader.decodeFromImageData(imageData);
      
      if (result?.text) {
        return handleSuccess(result.text);
      }
    } catch (e) {
      // Si échec, essayer avec rotations
      await tryDecodeWithRotations(ctx, width, height);
    }
  };

  /* Décodage avec rotations en cas d'échec */
  const tryDecodeWithRotations = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const reader = getReader();
    const rotations = [90, 180, 270]; // Seulement si nécessaire

    for (const deg of rotations) {
      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.translate(width / 2, height / 2);
          tempCtx.rotate((deg * Math.PI) / 180);
          tempCtx.drawImage(ctx.canvas, -width / 2, -height / 2);
          
          const imageData = tempCtx.getImageData(0, 0, width, height);
          const result = await reader.decodeFromImageData(imageData);
          
          if (result?.text) {
            return handleSuccess(result.text);
          }
        }
      } catch (e) {
        // Ignorer les erreurs de décodage
      }
    }
  };

  /* Succès avec debounce */
  const handleSuccess = (code: string) => {
    const now = Date.now();
    if (now - lastScanTime.current < 2000) return; // Debounce 2s
    
    lastScanTime.current = now;
    setScanAnimation(true);
    
    // Feedback visuel
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

  /* Arrêt complet */
  const stopAll = useCallback(() => {
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
    setVideoReady(false);
  }, []);

  /* Effects */
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopAll();
    }
    return () => stopAll();
  }, [isOpen, startCamera, stopAll]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
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
          autoPlay
        />
        
        {/* Canvas caché pour le traitement */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Overlay avec cadre TRANSPARENT */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Zones sombres autour du cadre */}
          <div className="absolute inset-0">
            {/* Top */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/30" />
            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/30" />
            {/* Left */}
            <div className="absolute top-1/3 bottom-1/3 left-0 w-12 bg-black/30" />
            {/* Right */}
            <div className="absolute top-1/3 bottom-1/3 right-0 w-12 bg-black/30" />
          </div>
          
          {/* Cadre de scan TRANSPARENT */}
          <div className="relative">
            <div 
              className={`w-80 h-24 border-2 rounded-lg transition-all duration-300 ${
                scanAnimation 
                  ? 'border-green-400 shadow-lg shadow-green-400/50' 
                  : 'border-white/60'
              }`}
            />
            
            {/* Coins animés */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-3 border-t-3 border-white rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-3 border-t-3 border-white rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-3 border-b-3 border-white rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-3 border-b-3 border-white rounded-br-lg" />
            
            {/* Ligne de scan animée */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div 
                className="absolute left-0 right-0 h-0.5 bg-red-500 opacity-80 animate-pulse"
                style={{
                  top: '50%',
                  animation: 'scan 2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 right-0 px-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white font-medium mb-2">
              Placez le code-barres dans le cadre
            </p>
            <p className="text-white/70 text-sm">
              Maintenez l'appareil stable • Éclairage suffisant requis
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80 backdrop-blur-sm">
        <div className="flex justify-center space-x-8">
          <button
            onClick={toggleTorch}
            className={`p-4 rounded-full transition-all ${
              torch 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Zap className="h-6 w-6" />
          </button>
          
          <button
            onClick={startCamera}
            disabled={isScanning}
            className="p-4 rounded-full bg-eco-leaf text-white hover:bg-eco-leaf/80 disabled:opacity-50"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
        
        {/* Debug info */}
        <div className="mt-4 text-center">
          <p className="text-white/50 text-xs">
            {videoReady ? '✓ Caméra active' : '⏳ Initialisation...'}
          </p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="absolute inset-x-4 top-20 bg-red-500/90 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white font-medium text-center">{error}</p>
          <button
            onClick={startCamera}
            className="mt-3 w-full py-2 bg-white/20 rounded-lg text-white font-medium"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        
        .border-l-3 { border-left-width: 3px; }
        .border-r-3 { border-right-width: 3px; }
        .border-t-3 { border-top-width: 3px; }
        .border-b-3 { border-bottom-width: 3px; }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;