import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  X
} from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

const ProductNotFoundPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const barcode = searchParams.get('barcode');
  
  const [photos, setPhotos] = useState<{
    front?: string;
    ingredients?: string;
    nutrition?: string;
  }>({});
  const [currentStep, setCurrentStep] = useState<'photos' | 'analysis' | 'complete'>('photos');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const { 
    hasPermission, 
    isActive, 
    startCamera, 
    stopCamera, 
    takePhoto,
    videoRef 
  } = useCamera();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Types de photos requis
  const photoTypes = [
    {
      key: 'front' as const,
      title: 'Face avant',
      description: 'Photo du produit avec le nom et la marque',
      icon: '📦',
      required: true
    },
    {
      key: 'ingredients' as const,
      title: 'Liste ingrédients',
      description: 'Photo de la liste des ingrédients/composition',
      icon: '🧾',
      required: true
    },
    {
      key: 'nutrition' as const,
      title: 'Tableau nutritionnel',
      description: 'Photo du tableau des valeurs nutritionnelles (si présent)',
      icon: '📊',
      required: false
    }
  ];

  // Prendre une photo avec la caméra
  const handleTakePhoto = async (type: keyof typeof photos) => {
    if (!videoRef.current || !isActive) {
      await startCamera();
      return;
    }

    const photoData = takePhoto(videoRef.current);
    if (photoData) {
      setPhotos(prev => ({ ...prev, [type]: photoData }));
      stopCamera();
    }
  };

  // Upload fichier
  const handleFileUpload = (type: keyof typeof photos) => {
    if (!fileInputRef.current) return;
    
    fileInputRef.current.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotos(prev => ({ ...prev, [type]: result }));
      };
      reader.readAsDataURL(file);
    };
    
    fileInputRef.current.click();
  };

  // Supprimer une photo
  const removePhoto = (type: keyof typeof photos) => {
    setPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[type];
      return newPhotos;
    });
  };

  // Analyser les photos avec l'IA
  const analyzePhotos = async () => {
    if (!photos.front || !photos.ingredients) {
      alert('⚠️ Veuillez fournir au minimum la photo de face et des ingrédients');
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep('analysis');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const payload = {
        barcode,
        photos: photos,
        source: 'user_photo_analysis',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${apiUrl}/api/products/analyze-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
        setCurrentStep('complete');
        
        // Redirection après 3 secondes vers le nouveau produit
        setTimeout(() => {
          if (result.productSlug) {
            navigate(`/product/${result.productSlug}`);
          } else {
            navigate('/');
          }
        }, 3000);
      } else {
        throw new Error('Erreur analyse IA');
      }
    } catch (error) {
      console.error('❌ Erreur analyse photos:', error);
      alert('❌ Erreur lors de l\'analyse. Réessayez plus tard.');
      setCurrentStep('photos');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Nombre de photos requises complétées
  const requiredPhotosCompleted = photoTypes
    .filter(type => type.required)
    .filter(type => photos[type.key]).length;
  
  const totalRequiredPhotos = photoTypes.filter(type => type.required).length;
  const canProceed = requiredPhotosCompleted === totalRequiredPhotos;

  if (!barcode) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-eco-text mb-4">Code-barres manquant</h1>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-eco-leaf text-white rounded-lg hover:bg-eco-leaf/90 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-eco-text/60 hover:text-eco-leaf transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
      </div>

      {/* Étapes */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          {['photos', 'analysis', 'complete'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === step 
                  ? 'bg-eco-leaf text-white' 
                  : index < ['photos', 'analysis', 'complete'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < ['photos', 'analysis', 'complete'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Titre principal */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-eco-text mb-4">
          Produit non trouvé
        </h1>
        <div className="bg-gray-100 inline-block px-4 py-2 rounded-lg mb-4">
          <span className="text-sm text-gray-600">Code-barres : </span>
          <span className="font-mono font-semibold">{barcode}</span>
        </div>
        <p className="text-eco-text/70 max-w-2xl mx-auto">
          Aidez-nous à enrichir notre base de données en photographiant ce produit. 
          Notre IA analysera automatiquement les informations pour créer une fiche produit complète.
        </p>
      </div>

      {currentStep === 'photos' && (
        <div className="space-y-8">
          {/* Grille de capture photos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photoTypes.map(photoType => (
              <div key={photoType.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{photoType.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-eco-text">{photoType.title}</h3>
                      {photoType.required && (
                        <span className="text-xs text-red-500 font-medium">Requis</span>
                      )}
                    </div>
                    {photos[photoType.key] && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-eco-text/70">{photoType.description}</p>
                </div>

                <div className="aspect-square relative bg-gray-50">
                  {photos[photoType.key] ? (
                    // Photo capturée
                    <div className="relative">
                      <img
                        src={photos[photoType.key]}
                        alt={photoType.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(photoType.key)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // Interface de capture
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      {isActive && (
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                          playsInline
                          muted
                        />
                      )}
                      
                      <div className="space-y-3 text-center relative z-10">
                        <button
                          onClick={() => handleTakePhoto(photoType.key)}
                          className="w-12 h-12 bg-eco-leaf text-white rounded-full flex items-center justify-center hover:bg-eco-leaf/90 transition-colors mx-auto"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                        
                        <div className="text-sm text-gray-500">ou</div>
                        
                        <button
                          onClick={() => handleFileUpload(photoType.key)}
                          className="flex items-center space-x-2 text-sm text-eco-leaf hover:text-eco-leaf/80 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choisir fichier</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progression */}
          <div className="bg-eco-leaf/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-eco-text">
                Progression : {requiredPhotosCompleted}/{totalRequiredPhotos} photos requises
              </span>
              <span className="text-sm text-eco-text/70">
                {Math.round((requiredPhotosCompleted / totalRequiredPhotos) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden">
              <div
                className="h-3 bg-eco-leaf rounded-full transition-all duration-500"
                style={{ width: `${(requiredPhotosCompleted / totalRequiredPhotos) * 100}%` }}
              />
            </div>
          </div>

          {/* Bouton analyse */}
          <div className="text-center">
            <button
              onClick={analyzePhotos}
              disabled={!canProceed}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                canProceed
                  ? 'bg-eco-leaf text-white hover:bg-eco-leaf/90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6" />
                <span>Analyser avec l'IA</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {currentStep === 'analysis' && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-eco-leaf/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-eco-leaf animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-eco-text mb-4">
            Analyse en cours...
          </h2>
          <p className="text-eco-text/70 mb-8 max-w-md mx-auto">
            Notre IA analyse vos photos pour extraire toutes les informations du produit.
          </p>
          <div className="w-8 h-8 border-2 border-eco-leaf/30 border-t-eco-leaf rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {currentStep === 'complete' && analysis && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-eco-text mb-4">
            Produit créé avec succès !
          </h2>
          <p className="text-eco-text/70 mb-8 max-w-md mx-auto">
            Merci ! Le produit "{analysis.productName || 'Sans nom'}" a été ajouté à notre base de données.
          </p>
          <div className="bg-eco-leaf/10 rounded-xl p-6 max-w-md mx-auto mb-8">
            <h3 className="font-semibold text-eco-text mb-3">Informations extraites :</h3>
            <div className="space-y-2 text-sm">
              {analysis.productName && (
                <div className="flex justify-between">
                  <span className="text-eco-text/70">Nom :</span>
                  <span className="font-medium">{analysis.productName}</span>
                </div>
              )}
              {analysis.brand && (
                <div className="flex justify-between">
                  <span className="text-eco-text/70">Marque :</span>
                  <span className="font-medium">{analysis.brand}</span>
                </div>
              )}
              {analysis.category && (
                <div className="flex justify-between">
                  <span className="text-eco-text/70">Catégorie :</span>
                  <span className="font-medium">{analysis.category}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-eco-text/60">
            Redirection automatique dans 3 secondes...
          </p>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ProductNotFoundPage;