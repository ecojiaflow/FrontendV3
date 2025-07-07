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

  // Charger ZXing dynamiquement
  useEffect(() => {
    const loadZXing = async () => {
      try {
        // Charger ZXing depuis CDN
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

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920, min: 640 }, // Résolution plus haute
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
        
        // Attendre que la vidéo soit prête
        setTimeout(() => {
          startZXingScanning();
          // Afficher bouton test après 10 secondes seulement
          setTimeout(() => setShowTestButton(true), 10000);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Erreur accès caméra:', err);
      setHasPermission(false);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setIsScanning(false);
    }
  };

  // Scanner avec ZXing
  const startZXingScanning = () => {
    if (!isZXingLoaded || !videoRef.current || scanResult) return;

    // Nettoyer l'ancien interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    console.log('🔍 Démarrage scan ZXing...');

    // Scanner toutes les 500ms
    scanIntervalRef.current = setInterval(() => {
      scanWithZXing();
    }, 500);
  };

  // Fonction de scan ZXing
  const scanWithZXing = () => {
    if (!videoRef.current || !window.ZXing || scanResult) return;

    try {
      const video = videoRef.current;
      
      // Créer canvas pour capture
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Capturer frame vidéo
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Obtenir ImageData
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Scanner avec ZXing
      const codeReader = new window.ZXing.BrowserMultiFormatReader();
      
      codeReader.decodeFromImageData(imageData)
        .then((result: any) => {
          if (result && result.text) {
            console.log('🎯 Code-barres détecté:', result.text);
            handleScanSuccess(result.text);
          }
        })
        .catch(() => {
          // Pas de code trouvé, continuer le scan
        });
        
    } catch (err) {
      // Erreur silencieuse, continuer le scan
      console.log('🔄 Scan en cours...');
    }
  };

  // Gérer succès scan
  const handleScanSuccess = (barcode: string) => {
    if (scanResult) return; // Éviter doublons
    
    setScanResult(barcode);
    
    // Arrêter le scanning
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Feedback
    navigator.vibrate?.(200);
    
    setTimeout(() => {
      onScanSuccess(barcode);
      handleClose();
    }, 2000);
  };

  // Test manuel avec VRAIS codes de votre base
  const handleTestScan = () => {
    // ✅ CODES RÉELS de votre base importée OpenFoodFacts
    const realCodes = [
      '5060853640124', // Super Berry Granola
      '5014067133804', // Natural Proper Organic Bio Live Yeogurt  
      '4260123456789', // Bio Datteln Getrocknet
      '3760074933444', // Boisson au soja, sucré
      '8712100000000', // Bio Organic Almond Drink
      '4000417025005', // Kokosöl
      '4260394010115', // Bio Kefir
      '7622210951958', // Bio passata
      '4000521006051'  // Frische Bio-Vollmilch
    ];
    
    const randomCode = realCodes[Math.floor(Math.random() * realCodes.length)];
    console.log('🧪 Test scan avec VRAI code:', randomCode);
    handleScanSuccess(randomCode);
  };

  // Arrêter la caméra
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

  // Toggle flash
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

  // Changer caméra
  const switchCamera = () => {
    stopCamera();
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Fermeture propre
  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    setShowTestButton(false);
    onClose();
  };

  // Auto-start
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
      {/* Header */}
      <div className="bg-eco-text/90 backdrop-blur text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-eco-leaf" />
          <div>
            <h2 className="text-lg font-semibold">Scanner ECOLOJIA</h2>
            <p className="text-sm text-white/70">
              {isZXingLoaded ? 'Moteur ZXing prêt' : 'Chargement moteur...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFlash}
            className={`p-2 rounded-full transition-colors ${
              flashEnabled 
                ? 'bg-eco-leaf text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {flashEnabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          </button>

          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-red-500/20 text-white hover:bg-red-500/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Zone de scan */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ filter: 'contrast(1.2) brightness(1.1)' }} // Améliorer contraste
        />

        {/* Bouton test DISCRET (apparaît après 10s) */}
        {showTestButton && !scanResult && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={handleTestScan}
              className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg text-sm border border-white/30 hover:bg-white/30 transition-colors"
            >
              🧪 Test
            </button>
          </div>
        )}

        {/* Guide de scan */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-52 border-4 border-eco-leaf rounded-2xl relative bg-eco-leaf/5">
            {/* Coins animés */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white"></div>

            {/* Ligne de scan */}
            {isScanning && !scanResult && (
              <div className="absolute top-0 left-0 w-full h-1 bg-eco-leaf shadow-lg animate-ping"></div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black/70 text-white px-6 py-3 rounded-xl">
            <p className="text-sm font-medium">
              {!isZXingLoaded ? '⏳ Chargement moteur ZXing...' :
               scanResult ? '✅ Code détecté!' :
               '📱 Placez le code-barres dans le cadre'}
            </p>
            {isZXingLoaded && !scanResult && (
              <p className="text-xs text-white/70 mt-1">
                49 produits bio dans la base • Scan temps réel
              </p>
            )}
          </div>
        </div>

        {/* Résultat */}
        {scanResult && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-eco-leaf text-white p-8 rounded-2xl shadow-2xl text-center animate-fade-in">
            <CheckCircle className="h-20 w-20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Code détecté !</h3>
            <p className="font-mono text-lg bg-white/20 px-4 py-2 rounded">{scanResult}</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-2">Recherche du produit...</p>
            </div>
          </div>
        )}
      </div>

      {/* Erreurs */}
      {error && (
        <div className="absolute bottom-20 left-4 right-4 bg-red-500 text-white p-4 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Erreur caméra</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Demande permissions */}
      {hasPermission === false && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm">
            <Camera className="h-16 w-16 text-eco-leaf mx-auto mb-4" />
            <h3 className="text-xl font-bold text-eco-text mb-4">
              Accès caméra requis
            </h3>
            <p className="text-eco-text/70 mb-6">
              Scanner ECOLOJIA nécessite l'accès à votre caméra pour détecter les codes-barres
            </p>
            <button
              onClick={startCamera}
              className="w-full bg-eco-leaf text-white py-3 rounded-lg font-medium hover:bg-eco-leaf/90 transition-colors"
            >
              Autoriser la caméra
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-eco-text/90 text-white p-4 text-center">
        <p className="text-sm text-white/70">
          🌱 Scanner ECOLOJIA • 49 produits bio • Moteur ZXing haute performance
        </p>
      </div>
    </div>
  );
};

export default BarcodeScanner;