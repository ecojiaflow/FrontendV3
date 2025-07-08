import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Camera } from 'lucide-react';
import * as realApi from '../api/realApi';

interface PhotoCaptureProps {
  label: string;
  onCapture: (base64: string) => void;
  defaultImage?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ label, onCapture, defaultImage }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);

    try {
      // Libérer toute caméra précédente
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      await new Promise(resolve => setTimeout(resolve, 300));

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
          className="border px-4 py-2 text-sm rounded-lg flex items-center justify-center space-x-2 w-full"
        >
          <Camera className="h-4 w-4" />
          <span>Ouvrir la caméra</span>
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

const ProductNotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { barcode } = useParams<{ barcode: string }>();
  
  const [photos, setPhotos] = useState<{
    front: string | null;
    ingredients: string | null;
    nutrition: string | null;
  }>({
    front: null,
    ingredients: null,
    nutrition: null
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoCapture = (photoType: 'front' | 'ingredients' | 'nutrition') => {
    return (base64: string) => {
      setPhotos(prev => ({
        ...prev,
        [photoType]: base64
      }));
    };
  };

  const handleAnalyze = async () => {
    if (!photos.front || !photos.ingredients || !photos.nutrition) {
      setError('Veuillez capturer les 3 photos avant de continuer.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🔄 Envoi photos pour analyse IA...');
      
      const response = await realApi.analyzePhotos({
        barcode: barcode || '',
        photos: {
          front: photos.front,
          ingredients: photos.ingredients,
          nutrition: photos.nutrition
        }
      });

      console.log('✅ Analyse terminée:', response);
      
      if (response.success && response.product) {
        navigate(`/product/${response.product.slug}`);
      } else {
        setError('Erreur lors de l\'analyse. Réessayez.');
      }
    } catch (err) {
      console.error('❌ Erreur analyse:', err);
      setError('Impossible d\'analyser les photos. Vérifiez votre connexion.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allPhotosReady = photos.front && photos.ingredients && photos.nutrition;

  return (
    <div className="min-h-screen bg-eco-bg">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-eco-text">
                Produit non trouvé
              </h1>
              <p className="text-sm text-gray-600">
                Code-barres: {barcode}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-eco-text mb-2">
              Aidez-nous à enrichir notre base !
            </h2>
            <p className="text-gray-600">
              Prenez 3 photos du produit et notre IA l'analysera automatiquement
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <PhotoCapture
              label="Face avant du produit"
              onCapture={handlePhotoCapture('front')}
              defaultImage={photos.front || undefined}
            />
            
            <PhotoCapture
              label="Liste des ingrédients"
              onCapture={handlePhotoCapture('ingredients')}
              defaultImage={photos.ingredients || undefined}
            />
            
            <PhotoCapture
              label="Informations nutritionnelles"
              onCapture={handlePhotoCapture('nutrition')}
              defaultImage={photos.nutrition || undefined}
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progression</span>
              <span className="text-sm text-eco-secondary">
                {Object.values(photos).filter(Boolean).length}/3 photos
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-eco-secondary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(photos).filter(Boolean).length / 3) * 100}%` 
                }}
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!allPhotosReady || isAnalyzing}
            className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
              allPhotosReady && !isAnalyzing
                ? 'bg-eco-leaf text-white hover:bg-eco-leaf/90'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>
                  {allPhotosReady 
                    ? 'Analyser avec l\'IA' 
                    : `Capturer ${3 - Object.values(photos).filter(Boolean).length} photo(s) restante(s)`
                  }
                </span>
              </>
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Comment fonctionne notre IA ?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Extraction automatique du nom et de la marque</li>
            <li>• Reconnaissance OCR des ingrédients</li>
            <li>• Calcul du score écologique (0-100%)</li>
            <li>• Création automatique de la fiche produit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFoundPage;