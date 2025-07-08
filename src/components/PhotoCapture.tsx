import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, Settings } from 'lucide-react';

interface PhotoCaptureProps {
  label: string;
  onCapture: (base64: string) => void;
  defaultImage?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  label, 
  onCapture, 
  defaultImage 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    // Vérifier les permissions au chargement
    checkCameraPermissions();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkCameraPermissions = async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionState(permissions.state as any);
      console.log('📹 Permission caméra:', permissions.state);
    } catch (err) {
      console.log('⚠️ Impossible de vérifier permissions');
    }
  };

  const handleCameraClick = async () => {
    console.log('🎯 Tentative ouverture caméra...');
    setError(null);
    
    try {
      // Contraintes plus permissives
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 }
        },
        audio: false
      };

      console.log('📱 Demande getUserMedia avec:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Stream caméra obtenu');
      streamRef.current = stream;
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            console.log('▶️ Vidéo démarrée');
            setIsCapturing(true);
          }).catch(playErr => {
            console.error('❌ Erreur play:', playErr);
            setError('Impossible de démarrer la vidéo');
          });
        };
      }
    } catch (err: any) {
      console.error('❌ Erreur getUserMedia:', err);
      setPermissionState('denied');
      
      if (err.name === 'NotAllowedError') {
        setError('Permission refusée. Autorisez l\'accès caméra et rechargez.');
      } else if (err.name === 'NotFoundError') {
        setError('Aucune caméra détectée sur cet appareil.');
      } else if (err.name === 'NotSupportedError') {
        setError('Caméra non supportée par ce navigateur.');
      } else {
        setError(`Erreur caméra: ${err.message}`);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Upload fichier:', file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      console.log('✅ Fichier converti en base64');
      setPreview(base64);
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    
    console.log('📸 Photo capturée via caméra');
    setPreview(base64);
    onCapture(base64);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const handleReset = () => {
    setPreview(null);
    setError(null);
    stopCamera();
  };

  const getPermissionInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      return "Sur iOS: Réglages > Safari > Caméra > Autoriser";
    } else if (isAndroid) {
      return "Sur Android: Paramètres > Apps > Navigateur > Permissions > Caméra";
    } else {
      return "Cliquez sur l'icône 🔒 dans la barre d'adresse";
    }
  };

  return (
    <div className="space-y-3 text-center border rounded-xl p-4 shadow-sm bg-white">
      <h3 className="font-semibold text-eco-text text-sm">{label}</h3>

      {preview ? (
        // Prévisualisation
        <div className="space-y-3">
          <img
            src={preview}
            alt="Photo"
            className="rounded-lg max-h-40 mx-auto object-cover border"
          />
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
          >
            🔄 Reprendre la photo
          </button>
        </div>
      ) : isCapturing ? (
        // Mode capture vidéo
        <div className="space-y-3">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-40 rounded-lg border"
            />
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleCapture}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            📸 Capturer
          </button>
        </div>
      ) : (
        // Boutons initiaux
        <div className="space-y-3">
          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          
          {/* Bouton caméra */}
          <button
            onClick={handleCameraClick}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>📷 Prendre une photo</span>
          </button>

          {/* Bouton upload alternatif */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <span>📁</span>
              <span>Choisir une photo</span>
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">Problème d'accès caméra</p>
          </div>
          <p className="text-xs text-red-600">{error}</p>
          
          {permissionState === 'denied' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
              <div className="flex items-center space-x-1 text-blue-700 mb-1">
                <Settings className="h-3 w-3" />
                <span className="text-xs font-medium">Comment autoriser:</span>
              </div>
              <p className="text-xs text-blue-600">{getPermissionInstructions()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;