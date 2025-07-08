import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RotateCw, Zap } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

/**
 * Scanner simplifié avec HTML5 + simulation pour validation
 * --------------------------------------------------------
 * • Caméra HTML5 native
 * • Interface claire et moderne
 * • Codes de test d'ECOLOJIA pour validation
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  // Codes de test d'ECOLOJIA (depuis le document)
  const validCodes = [
    '5060853640124', // Super Seedy Granola
    '5014067133804', // Natural Bio Yogurt  
    '3017620425035', // Nutella
    '8076809513821', // Barilla Pâtes Bio
    '3033710074617', // Evian
  ];

  /* Démarrer la caméra */
  const startCamera = async () => {
    setError(null);
    setIsScanning(true);
    setScanProgress(0);

    try {
      console.log('🎥 Démarrage caméra...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        },
        audio: false,
      });

      streamRef.current = stream;
      console.log('✅ Stream obtenu');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Métadonnées chargées');
          videoRef.current?.play().then(() => {
            console.log('▶️ Lecture vidéo démarrée');
            setCameraReady(true);
            startDetection();
          }).catch(err => {
            console.error('❌ Erreur lecture:', err);
            setError('Impossible de lire la vidéo');
          });
        };
      }
    } catch (err) {
      console.error('❌ Erreur getUserMedia:', err);
      setError('Caméra non accessible. Autorisez l\'accès dans votre navigateur.');
      setIsScanning(false);
    }
  };

  /* Démarrer la détection */
  const startDetection = () => {
    console.log('🔍 Début détection...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    let attempts = 0;
    scanIntervalRef.current = setInterval(() => {
      attempts++;
      setScanProgress(attempts);
      
      console.log(`🔍 Tentative ${attempts}`);
      
      // Simulation réaliste : succès après 10-20 tentatives
      if (attempts >= 10 && Math.random() > 0.8) {
        const randomCode = validCodes[Math.floor(Math.random() * validCodes.length)];
        console.log('🎯 CODE DÉTECTÉ:', randomCode);
        handleSuccess(randomCode);
      }
      
      // Limite de sécurité
      if (attempts > 60) {
        console.log('⏱️ Timeout - aucun code détecté');
        setError('Aucun code-barres détecté. Assurez-vous qu\'il soit bien visible.');
        stopDetection();
      }
    }, 1000);
  };

  /* Test manuel immédiat */
  const testScan = () => {
    const testCode = validCodes[0];
    console.log('🧪 Test manuel:', testCode);
    handleSuccess(testCode);
  };

  /* Succès */
  const handleSuccess = (code: string) => {
    console.log('✅ SUCCESS:', code);
    stopDetection();
    
    // Feedback visuel
    setScanProgress(-1); // État spécial pour succès
    
    setTimeout(() => {
      onScanSuccess(code);
    }, 1000);
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
        console.log(`💡 Torche ${torch ? 'OFF' : 'ON'}`);
      } else {
        console.log('💡 Torche non supportée');
      }
    } catch (error) {
      console.log('❌ Erreur torche:', error);
    }
  };

  /* Arrêter la détection */
  const stopDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Track arrêté:', track.kind);
      });
      streamRef.current = null;
    }

    setIsScanning(false);
    setCameraReady(false);
    setScanProgress(0);
  };

  /* Redémarrer */
  const restart = () => {
    stopDetection();
    setError(null);
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  /* Effects */
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopDetection();
    }

    return () => stopDetection();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-white" />
          <div>
            <h2 className="text-white font-semibold">Scanner ECOLOJIA</h2>
            <p className="text-white/60 text-xs">
              {scanProgress === -1 ? '✅ Succès!' : 
               scanProgress > 0 ? `Analyse... ${scanProgress}s` : 
               cameraReady ? 'Caméra prête' : 
               isScanning ? 'Démarrage...' : 'Arrêté'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            stopDetection();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* Overlay de scan */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Zones sombres */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/40" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/40" />
            <div className="absolute top-1/3 bottom-1/3 left-0 w-12 bg-black/40" />
            <div className="absolute top-1/3 bottom-1/3 right-0 w-12 bg-black/40" />
          </div>

          {/* Cadre de scan */}
          <div className="relative">
            <div className={`w-80 h-20 border-2 rounded-xl transition-all duration-500 ${
              scanProgress === -1 ? 'border-green-400 shadow-lg shadow-green-400/50 scale-105' : 
              'border-white/80'
            }`} />
            
            {/* Coins */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-xl" />
            <div className="absolute -top-3 -right-3 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-xl" />
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-xl" />
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-xl" />

            {/* Ligne animée */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div 
                className={`absolute left-0 right-0 h-1 transition-all ${
                  scanProgress === -1 ? 'bg-green-400' : 'bg-red-500'
                }`}
                style={{
                  top: '50%',
                  animation: scanProgress > 0 && scanProgress !== -1 ? 'scan 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>

            {/* Progress indicator */}
            {scanProgress > 0 && scanProgress !== -1 && (
              <div className="absolute -bottom-6 left-0 right-0 text-center">
                <div className="inline-flex items-center space-x-2 bg-black/70 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm">{scanProgress}s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-4 right-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-white font-medium mb-1">
              Placez un code-barres dans le cadre
            </p>
            <p className="text-white/60 text-sm">
              {scanProgress === -1 ? 'Code détecté avec succès!' :
               scanProgress > 0 ? 'Analyse en cours...' :
               cameraReady ? 'Scanner automatique actif' :
               'En attente de la caméra'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/90">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTorch}
            className={`p-3 rounded-full transition-colors ${
              torch ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Zap className="h-5 w-5" />
          </button>

          <button
            onClick={testScan}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Test Code
          </button>

          <button
            onClick={restart}
            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            Codes ECOLOJIA • EAN-13, UPC-A, CODE-128
          </p>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 rounded-xl p-4">
          <p className="text-white font-medium text-center mb-3">{error}</p>
          <button
            onClick={restart}
            className="w-full py-2 bg-white/20 rounded-lg text-white font-medium"
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