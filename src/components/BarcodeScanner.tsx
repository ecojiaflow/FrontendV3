import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Zap, RotateCw } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Scanner fiable avec ZXing natif + UI moderne
 * -------------------------------------------
 * • ZXing via CDN pour garantir la compatibilité
 * • Détection simple et efficace
 * • Pas de fallback complexe
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const readerRef = useRef<any>(null);

  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  /* Initialiser ZXing depuis CDN */
  const initializeZXing = () => {
    return new Promise((resolve) => {
      if (window.ZXing) {
        resolve(window.ZXing);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/library@latest/umd/index.min.js';
      script.onload = () => {
        console.log('✅ ZXing chargé');
        resolve(window.ZXing);
      };
      script.onerror = () => {
        console.error('❌ Échec chargement ZXing');
        resolve(null);
      };
      document.head.appendChild(script);
    });
  };

  /* Créer le reader ZXing */
  const createReader = async () => {
    const ZXing = await initializeZXing();
    if (!ZXing) return null;

    try {
      const hints = new Map();
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
        ZXing.BarcodeFormat.EAN_13,
        ZXing.BarcodeFormat.EAN_8,
        ZXing.BarcodeFormat.UPC_A,
        ZXing.BarcodeFormat.CODE_128,
      ]);
      hints.set(ZXing.DecodeHintType.TRY_HARDER, true);

      readerRef.current = new ZXing.BrowserMultiFormatReader(hints);
      console.log('✅ Reader ZXing créé');
      return readerRef.current;
    } catch (error) {
      console.error('❌ Erreur création reader:', error);
      return null;
    }
  };

  /* Démarrer la caméra */
  const startCamera = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          console.log('✅ Vidéo démarrée');
          startScanning();
        };
      }
    } catch (err) {
      console.error('❌ Erreur caméra:', err);
      setError('Impossible d\'accéder à la caméra');
      setIsScanning(false);
    }
  };

  /* Démarrer le scan */
  const startScanning = async () => {
    const reader = await createReader();
    if (!reader || !videoRef.current) {
      setError('Impossible d\'initialiser le scanner');
      return;
    }

    console.log('🔍 Début du scan...');

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(async () => {
      await performScan(reader);
    }, 400);
  };

  /* Effectuer un scan */
  const performScan = async (reader: any) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) return;

    setScanCount(prev => prev + 1);

    try {
      // Créer un canvas temporaire
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Capturer l'image
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir en ImageData
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Tenter le décodage
      const result = await reader.decodeFromImageData(imageData);
      
      if (result && result.text) {
        console.log('🎯 Code détecté:', result.text);
        handleSuccess(result.text);
      }
    } catch (error) {
      // Ignorer les erreurs de scan normales
    }
  };

  /* Succès */
  const handleSuccess = (code: string) => {
    console.log('✅ Scan réussi:', code);
    stopScanning();
    onScanSuccess(code);
  };

  /* Toggle torche */
  const toggleTorch = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !torch }]
        });
        setTorch(!torch);
      }
    } catch (error) {
      console.log('Torche non disponible');
    }
  };

  /* Redémarrer */
  const restart = () => {
    stopScanning();
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  /* Arrêter le scan */
  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (error) {
        // Ignorer les erreurs de reset
      }
      readerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
    setScanCount(0);
  };

  /* Effects */
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [isOpen]);

  // Déclarer le type global pour ZXing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ZXing = (window as any).ZXing || null;
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-white" />
          <div>
            <h2 className="text-white font-semibold">Scanner de codes-barres</h2>
            <p className="text-white/60 text-xs">
              {isScanning ? `Tentatives: ${scanCount}` : 'Arrêté'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            stopScanning();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Zone de scan */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Zones sombres */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/40" />
            <div className="absolute top-1/3 bottom-1/3 left-0 w-8 bg-black/40" />
            <div className="absolute top-1/3 bottom-1/3 right-0 w-8 bg-black/40" />
          </div>

          {/* Cadre de scan */}
          <div className="relative">
            <div className="w-80 h-20 border-2 border-white/80 rounded-xl" />
            
            {/* Coins */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-xl" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-xl" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-xl" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-xl" />

            {/* Ligne de scan */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div 
                className="absolute left-0 right-0 h-1 bg-red-500 opacity-70"
                style={{
                  top: '50%',
                  animation: isScanning ? 'scan 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-4 right-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white font-medium mb-1">
              Centrez le code-barres dans le cadre
            </p>
            <p className="text-white/60 text-sm">
              Maintenez l'appareil stable
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/90">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleTorch}
            className={`p-4 rounded-full transition-colors ${
              torch 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Zap className="h-6 w-6" />
          </button>

          <button
            onClick={restart}
            className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <RotateCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 rounded-xl p-4">
          <p className="text-white font-medium text-center">{error}</p>
          <button
            onClick={restart}
            className="mt-3 w-full py-2 bg-white/20 rounded-lg text-white"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        @keyframes scan {
          0% { top: 20%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;