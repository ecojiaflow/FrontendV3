import { useState, useRef, useCallback } from 'react';

interface CameraCapabilities {
  facingModes: string[];
  hasFlash: boolean;
  maxResolution: { width: number; height: number };
}

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Demander les permissions caméra
  const requestPermission = useCallback(async () => {
    try {
      setError(null);
      
      // Test d'accès rapide
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Analyser les capacités
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const trackCapabilities = videoTrack.getCapabilities();
      
      setCapabilities({
        facingModes: trackCapabilities.facingMode || ['user'],
        hasFlash: 'torch' in trackCapabilities,
        maxResolution: {
          width: trackCapabilities.width?.max || 1280,
          height: trackCapabilities.height?.max || 720
        }
      });

      // Arrêter le stream de test
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error('❌ Permission caméra refusée:', err);
      setHasPermission(false);
      setError('Accès à la caméra refusé. Vérifiez les paramètres de votre navigateur.');
      return false;
    }
  }, []);

  // Démarrer la caméra
  const startCamera = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      setError(null);
      
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      streamRef.current = stream;
      setIsActive(true);

      // Si un élément video est fourni, l'attacher
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      return stream;
    } catch (err) {
      console.error('❌ Impossible de démarrer la caméra:', err);
      setError('Impossible de démarrer la caméra');
      setIsActive(false);
      throw err;
    }
  }, []);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
  }, []);

  // Prendre une photo
  const takePhoto = useCallback((video: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (err) {
      console.error('❌ Erreur capture photo:', err);
      return null;
    }
  }, []);

  // Changer de caméra (avant/arrière)
  const switchCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    if (isActive) {
      stopCamera();
    }

    await startCamera({
      video: {
        facingMode,
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      },
      audio: false
    });
  }, [isActive, stopCamera, startCamera]);

  // Activer/désactiver le flash
  const toggleFlash = useCallback(async (enabled: boolean) => {
    if (!streamRef.current || !capabilities?.hasFlash) {
      return false;
    }

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        advanced: [{ torch: enabled } as any]
      });
      return true;
    } catch (err) {
      console.warn('Flash non supporté:', err);
      return false;
    }
  }, [capabilities]);

  // Nettoyer en cas de démontage
  const cleanup = useCallback(() => {
    stopCamera();
    setHasPermission(null);
    setError(null);
    setCapabilities(null);
  }, [stopCamera]);

  return {
    hasPermission,
    isActive,
    error,
    capabilities,
    streamRef,
    videoRef,
    requestPermission,
    startCamera,
    stopCamera,
    takePhoto,
    switchCamera,
    toggleFlash,
    cleanup
  };
};