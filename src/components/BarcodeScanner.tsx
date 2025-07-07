import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Zap, ZapOff, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

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

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isZXingLoaded, setIsZXingLoaded] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const codeReader = useRef<any>(null);

  useEffect(() => {
    const loadZXing = async () => {
      try {
        if (!window.ZXing) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@zxing/library@latest/umd/index.min.js';
          script.onload = () => {
            console.log('✅ ZXing chargé avec succès');
            setIsZXingLoaded(true);
          };
          script.onerror = () => {
            console.error('❌ Erreur chargement ZXing');
            setIsZXingLoaded(false);
          };
          document.head.appendChild(script);
        } else {
          setIsZXingLoaded(true);
        }
      } catch (err) {
        console.error('❌ Erreur ZXing:', err);
        setIsZXingLoaded(false);
      }
    };

    if (isOpen) {
      loadZXing();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      console.log("📷 startCamera()");
      setError(null);
      setIsScanning(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log("🎥 Flux vidéo démarré", stream);

        setTimeout(() => {
          if (videoRef.current?.videoWidth === 0) {
            console.warn("⚠️ Flux vidéo vide (videoWidth = 0)");
          } else {
            console.log("✅ Flux vidéo actif", videoRef.current.videoWidth, videoRef.current.videoHeight);
          }
          startZXingScanning();
          setTimeout(() => setShowTestButton(true), 10000);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Erreur accès caméra:', err);
      setHasPermission(false);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  const startZXingScanning = () => {
    if (!isZXingLoaded || !videoRef.current || scanResult) return;

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (!codeReader.current && window.ZXing) {
      codeReader.current = new window.ZXing.BrowserMultiFormatReader();
    }

    console.log('🔍 Démarrage scan ZXing...');

    scanIntervalRef.current = setInterval(() => {
      scanWithZXing();
    }, 500);
  };

  const scanWithZXing = () => {
    if (!videoRef.current || !window.ZXing || scanResult) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      console.log("🔎 Analyse frame", imageData);

      if (!imageData || imageData.data.length === 0) {
        console.log("❌ ImageData vide, on saute ce scan.");
        return;
      }

      codeReader.current.decodeFromImageData(imageData)
        .then((result: any) => {
          if (result && result.text) {
            console.log('🎯 Code-barres détecté:', result.text);
            handleScanSuccess(result.text);
          }
        })
        .catch(() => {
          console.log("⏳ Aucun code détecté cette fois");
        });
    } catch (err) {
      console.warn('⚠️ Erreur pendant scanWithZXing', err);
    }
  };

  const handleScanSuccess = (barcode: string) => {
    if (scanResult) return;

    setScanResult(barcode);

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    navigator.vibrate?.(200);

    setTimeout(() => {
      onScanSuccess(barcode);
      handleClose();
    }, 2000);
  };

  const handleTestScan = () => {
    const realCodes = [
      '5060853640124', '5014067133804', '4260123456789',
      '3760074933444', '8712100000000', '4000417025005',
      '4260394010115', '7622210951958', '4000521006051'
    ];

    const randomCode = realCodes[Math.floor(Math.random() * realCodes.length)];
    console.log('🧪 Test scan avec VRAI code:', randomCode);
    handleScanSuccess(randomCode);
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      }
    } catch (err) {
      console.warn('Flash non supporté:', err);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    setShowTestButton(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && hasPermission !== false) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* UI rendering non modifié pour compacité */}
    </div>
  );
};

export default BarcodeScanner;
