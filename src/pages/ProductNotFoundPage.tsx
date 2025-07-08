import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import PhotoCapture from '../components/PhotoCapture';
import { realApi } from '../api/realApi';

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
        // Rediriger vers la page du nouveau produit
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
      {/* Header */}
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

      {/* Contenu principal */}
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

          {/* Grid photos */}
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

          {/* Progression */}
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

          {/* Bouton analyse */}
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

        {/* Info IA */}
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