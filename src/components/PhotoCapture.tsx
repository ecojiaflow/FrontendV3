import React, { useEffect, useRef, useState } from "react";
import { stopScannerCamera } from "../utils/scannerControl";

interface Props {
  label: string;
  onCapture: (base64: string) => void;
  defaultImage?: string;
}

const PhotoCapture: React.FC<Props> = ({ label, onCapture, defaultImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);

    try {
      // Libérer d'abord la caméra du scanner
      stopScannerCamera();

      // Attendre que la caméra soit totalement libérée
      await new Promise(resolve => setTimeout(resolve, 500));

      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      setStream(media);

      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.setAttribute('playsinline', 'true');

        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current!.play();
            setIsCapturing(true);
          } catch (playError) {
            console.warn("⚠️ play() a échoué :", playError);
            setError("Impossible de démarrer la vidéo");
          }
        };
      }
    } catch (err) {
      console.error("❌ Erreur accès caméra", err);
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(base64);
    onCapture(base64);
    stopCamera();
  };

  const resetPhoto = () => {
    setPreview(null);
    stopCamera();
  };

  return (
    <div className="space-y-2 text-center border rounded-xl p-4 shadow-sm bg-white">
      <h3 className="font-semibold text-eco-text">{label}</h3>

      {preview ? (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Prévisualisation"
            className="rounded-xl max-h-48 mx-auto object-contain"
          />
          <button
            onClick={resetPhoto}
            className="text-sm text-blue-600 underline"
          >
            Reprendre la photo
          </button>
        </div>
      ) : isCapturing ? (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl border"
          />
          <button
            onClick={takePhoto}
            className="bg-eco-leaf text-white px-4 py-2 rounded-lg font-semibold"
          >
            📸 Capturer
          </button>
        </div>
      ) : (
        <button
          onClick={startCamera}
          className="border px-4 py-2 text-sm rounded-lg"
        >
          📷 Ouvrir la caméra
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhotoCapture;