
import React, { useEffect, useRef, useState } from "react";

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
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(media);

      if (videoRef.current) {
        videoRef.current.srcObject = media;

        await videoRef.current.play().catch((err) => {
          console.warn("⚠️ play() a échoué :", err);
        });
      }

      setIsCapturing(true);
    } catch (err) {
      console.error("❌ Erreur accès caméra", err);
      setError("Impossible d'accéder à la caméra.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
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

      <c
