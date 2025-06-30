import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Leaf, 
  Users, 
  Shield,
  Share2,
  Heart,
  Star,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import ConfidenceBadge from "../components/ConfidenceBadge";
import PartnerLinks from "../components/PartnerLinks";
import SimilarProductsCarousel from "../components/SimilarProductsCarousel";
import { fetchProductBySlug } from '../api/realApi';

interface Partner {
  id: string;
  name: string;
  website?: string;
  commission_rate: number;
  ethical_score: number;
}

interface PartnerLink {
  id: string;
  url: string;
  tracking_id?: string;
  commission_rate: number;
  clicks: number;
  partner: Partner;
}

interface Product {
  id: string;
  nameKey: string;
  brandKey?: string;
  descriptionKey: string;
  ethicalScore: number;
  category: string;
  price: number;
  currency: string;
  image: string;
  tagsKeys: string[];
  verified: boolean;
  affiliateLink: string;
  certificationsKeys: string[];
  aiConfidence: number;
  zonesDisponibles: string[];
  slug: string;
  resumeFr?: string;
  confidencePct?: number;
  confidenceColor?: "green" | "yellow" | "red";
  verifiedStatus?: string;
  partnerLinks?: PartnerLink[];
  enriched_at?: string;
}

const fallbackImage = "https://via.assets.so/img.jpg?w=400&h=400&tc=gray&bg=%23f3f4f6&t=Produit";

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'analysis'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  // Gestion intelligente des images
  const getProductImage = (product: Product) => {
    if (product.image?.trim() && !product.image.includes('fallback')) {
      return product.image.trim();
    }
    
    // Fallback par catégorie
    const categoryFallbacks: Record<string, string> = {
      'alimentaire': 'https://via.assets.so/img.jpg?w=400&h=400&tc=gray&bg=%23f3f4f6&t=Alimentaire',
      'cosmétique': 'https://via.assets.so/img.jpg?w=400&h=400&tc=gray&bg=%23f3f4f6&t=Cosmétique',
      'hygiène': 'https://via.assets.so/img.jpg?w=400&h=400&tc=gray&bg=%23f3f4f6&t=Hygiène'
    };
    
    return categoryFallbacks[product.category || ''] || fallbackImage;
  };

  useEffect(() => {
    if (!slug || slug === 'undefined' || slug === 'null' || slug.trim() === '' || slug.includes('undefined')) {
      console.error('🚨 Slug invalide :', slug);
      navigate('/', { replace: true });
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await fetchProductBySlug(slug);
        
        if (!productData) {
          setError("Produit non trouvé");
          return;
        }

        setProduct(productData);

        try {
          const favorites = JSON.parse(localStorage.getItem('ecolojia_favorites') || '[]');
          setIsFavorite(favorites.includes(productData.id));
        } catch (e) {
          console.warn('Erreur lecture favoris:', e);
        }
      } catch (err) {
        console.error('❌ Erreur chargement produit:', err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const toggleFavorite = () => {
    if (!product) return;
    
    try {
      const favorites = JSON.parse(localStorage.getItem('ecolojia_favorites') || '[]');
      const newFavorites = isFavorite 
        ? favorites.filter((id: string) => id !== product.id)
        : [...favorites, product.id];
      localStorage.setItem('ecolojia_favorites', JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.warn('Erreur sauvegarde favoris:', e);
    }
  };

  const shareProduct = async () => {
    if (!product) return;
    
    const shareData = {
      title: `${product.nameKey} - Ecolojia`,
      text: `Découvrez ce produit éco-responsable : ${product.nameKey}`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage('Lien copié !');
        setTimeout(() => setShareMessage(''), 2000);
      }
    } catch (err) {
      console.error('Erreur partage:', err);
    }
  };

  const getScoreLevel = (score?: number) => {
    if (!score) return { label: 'Non évalué', color: 'gray' };
    if (score >= 4) return { label: 'Excellent', color: 'green' };
    if (score >= 3) return { label: 'Très bon', color: 'yellow' };
    if (score >= 2) return { label: 'Bon', color: 'orange' };
    return { label: 'À améliorer', color: 'red' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-eco-leaf rounded-full border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur</h1>
        <p className="text-gray-600 mb-6">{error ?? "Produit introuvable"}</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-eco-leaf text-white rounded-lg hover:bg-eco-leaf/90 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const scoreLevel = getScoreLevel(product.ethicalScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-eco-text/60 hover:text-eco-leaf transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        
        <div className="flex items-center space-x-3">
          {shareMessage && (
            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {shareMessage}
            </span>
          )}
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={shareProduct}
            className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-eco-leaf">Accueil</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.nameKey}</span>
        </div>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-12">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-eco-leaf/20 relative">
            <img
              src={getProductImage(product)}
              alt={product.nameKey}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
            {product.verified && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Vérifié</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations produit */}
        <div className="space-y-6">
          <div>
            {/* Catégorie */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            {/* Marque */}
            {product.brandKey && (
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.brandKey}</p>
            )}

            {/* Titre */}
            <h1 className="text-3xl font-bold text-eco-text mb-4">{product.nameKey}</h1>

            {/* Score principal */}
            <div className="bg-gradient-to-r from-eco-leaf/10 to-green-100 p-6 rounded-xl border border-eco-leaf/20 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Leaf className="h-6 w-6 text-eco-leaf" />
                  <span className="text-lg font-semibold text-eco-text">Score écologique</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-eco-leaf">
                    {(product.ethicalScore).toFixed(1)}/5
                  </div>
                  <div className={`text-sm font-medium text-${scoreLevel.color}-600`}>
                    {scoreLevel.label}
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/50 h-4 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-gradient-to-r from-eco-leaf to-green-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(product.ethicalScore / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Badges statut */}
            <div className="flex items-center gap-4 mb-6">
              {product.confidencePct && (
                <ConfidenceBadge
                  pct={product.confidencePct}
                  color={product.confidenceColor ?? "yellow"}
                  className=""
                />
              )}
              {product.verified && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Vérifié</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {product.tagsKeys?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Caractéristiques</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tagsKeys.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="px-3 py-1 bg-eco-leaf/10 border border-eco-leaf/20 text-sm rounded-full text-eco-text font-medium hover:bg-eco-leaf/20 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Zones de disponibilité */}
            {product.zonesDisponibles && product.zonesDisponibles.length > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Disponible : {product.zonesDisponibles.join(', ')}
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="text-2xl font-bold text-eco-leaf mb-4">
              {product.price.toFixed(2)} {product.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Onglets détails */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-12">
        {/* Navigation onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Description', icon: Leaf },
              { id: 'score', label: 'Analyse du score', icon: TrendingUp },
              { id: 'analysis', label: 'Analyse IA', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-eco-leaf text-eco-leaf'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu onglets */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description du produit</h3>
                <p className="text-gray-700 leading-relaxed">{product.descriptionKey}</p>
              </div>
              
              {product.certificationsKeys && product.certificationsKeys.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Certifications</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {product.certificationsKeys.map((cert, index) => (
                      <div
                        key={`${cert}-${index}`}
                        className="bg-eco-leaf/10 text-eco-leaf px-3 py-2 rounded-lg text-sm font-medium text-center border border-eco-leaf/20"
                      >
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'score' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Détail du scoring</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Score global</span>
                    <span className="text-2xl font-bold text-eco-leaf">
                      {product.ethicalScore.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-eco-leaf h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(product.ethicalScore / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Analyse par intelligence artificielle</h3>
              
              {product.resumeFr ? (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Résumé de l'analyse</h4>
                      <p className="text-blue-800 leading-relaxed">{product.resumeFr}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Analyse IA en cours de traitement pour ce produit</p>
                </div>
              )}

              {/* Métriques de confiance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Métriques de confiance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Confiance IA</span>
                    <div className="text-lg font-bold">
                      {product.confidencePct || Math.round(product.aiConfidence * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Statut</span>
                    <div className={`text-lg font-bold ${
                      product.verified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {product.verified ? 'Vérifié' : 'En révision'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liens partenaires */}
      {product.partnerLinks && product.partnerLinks.length > 0 && (
        <div className="border-t pt-6 mb-12">
          <PartnerLinks partnerLinks={product.partnerLinks} productTitle={product.nameKey} />
        </div>
      )}

      {/* Suggestions similaires */}
      {product.id && product.id !== 'undefined' && product.id.trim() !== '' && (
        <div className="border-t pt-6">
          <SimilarProductsCarousel productId={product.id} />
        </div>
      )}
    </div>
  );
};

export default ProductPage;