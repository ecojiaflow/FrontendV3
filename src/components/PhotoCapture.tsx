import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { stopScannerCamera } from '../utils/scannerControl';

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
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    
    try {
      console.log('🎥 Démarrage caméra PhotoCapture...');
      
      // Arrêter toute caméra scanner existante
      await stopScannerCamera();
      
      // Attendre un peu pour libérer les ressources
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Demander accès caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        // Attendre que les métadonnées soient chargées
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current!.play();
            setIsCapturing(true);
            console.log('✅ Caméra PhotoCapture démarrée');
          } catch (playError) {
            console.error('❌ Erreur play():', playError);
            setError('Impossible de démarrer la vidéo');
          }
        };
      }
    } catch (err) {
      console.error('❌ Erreur accès caméra PhotoCapture:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Refs manquantes pour capture');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Contexte canvas manquant');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.9);
      
      console.log('📸 Photo capturée:', base64.substring(0, 50) + '...');
      
      setPreview(base64);
      onCapture(base64);
      stopCamera();
    } catch (err) {
      console.error('❌ Erreur capture photo:', err);
      setError('Erreur lors de la capture');
    }
  };

  const resetPhoto = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-3 text-center border rounded-xl p-4 shadow-sm bg-white">
      <h3 className="font-semibold text-eco-text text-sm">{label}</h3>

      {preview ? (
        // Mode prévisualisation
        <div className="space-y-3">
          <div className="relative">
            <img
              src={preview}
              alt="Prévisualisation"
              className="rounded-lg max-h-40 mx-auto object-cover border"
            />
          </div>
          <button
            onClick={resetPhoto}
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
              className="w-full max-h-40 rounded-lg border object-cover"
            />
            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={takePhoto}
            className="bg-eco-leaf text-white px-4 py-2 rounded-lg font-semibold hover:bg-eco-leaf/90 transition-colors"
          >
            📸 Capturer
          </button>
        </div>
      ) : (
        // Mode initial - bouton pour ouvrir caméra
        <div className="space-y-3">
          <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <button
            onClick={startCamera}
            className="w-full py-2 px-4 border border-eco-leaf text-eco-leaf rounded-lg font-medium hover:bg-eco-leaf hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>📷 Ouvrir la caméra</span>
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;