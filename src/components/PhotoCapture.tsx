import React, { useRef, useState, useEffect } from "react";

interface PhotoCaptureProps {
  label: string;
  onCapture: (dataUrl: string) => void;
  defaultImage?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  label,
  onCapture,
  defaultImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      setIsCapturing(true);
    } catch (err) {
      console.error("Erreur accès caméra", err);
      setError("Impossible d'accéder à la caméra.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current) videoRef.current.pause();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreview(dataUrl);
      onCapture(dataUrl);
      stopCamera();
    }
  };

  const reset = () => {
    setPreview(null);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center space-y-3">
      <h4 className="font-medium text-eco-text">{label}</h4>

      {preview && (
        <div>
          <img
            src={preview}
            alt="Aperçu"
            className="w-full max-h-60 object-contain rounded-lg"
          />
          <button
            onClick={reset}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Reprendre la photo
          </button>
        </div>
      )}

      {!preview && (
        <div className="space-y-2">
          {isCapturing ? (
            <div className="space-y-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-64 rounded-lg border"
              />
              <button
                onClick={takePhoto}
                className="w-full px-4 py-2 bg-eco-leaf text-white rounded-lg font-semibold shadow"
              >
                📸 Capturer
              </button>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full px-4 py-2 bg-gray-100 text-eco-text font-medium rounded-lg border"
            >
              📷 Ouvrir la caméra
            </button>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhotoCapture;
