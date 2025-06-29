import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Users, Shield } from "lucide-react";

import ConfidenceBadge from "../components/ConfidenceBadge";
import PartnerLinks from "../components/PartnerLinks";
import SimilarProductsCarousel from "../components/SimilarProductsCarousel";
import EcoScoreBadge from "../components/EcoScoreBadge";

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
  title: string;
  slug: string;
  description: string;
  brand?: string;
  category?: string;
  tags: string[];
  image_url?: string;
  eco_score?: number;
  ai_confidence?: number;
  confidence_pct?: number;
  confidence_color?: "green" | "yellow" | "red";
  verified_status: "verified" | "manual_review" | "rejected";
  resume_fr?: string;
  partnerLinks: PartnerLink[];
  enriched_at?: string;
}

const fallbackImage = "/fallback.png";


const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Slug manquant");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const finalUrl = `${API_BASE_URL}/api/products/${encodeURIComponent(slug)}`;
        const response = await fetch(finalUrl, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(response.status === 404 ? "Produit non trouvé" : "Erreur serveur");
        }

        const data: Product | { product: Product } = await response.json();
        const rawProduct = (data as any).product ?? data;

        const normalized: Product = {
          ...rawProduct,
          eco_score: typeof rawProduct.eco_score === "string" ? parseFloat(rawProduct.eco_score) : rawProduct.eco_score,
          ai_confidence: typeof rawProduct.ai_confidence === "string" ? parseFloat(rawProduct.ai_confidence) : rawProduct.ai_confidence
        };

        setProduct(normalized);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-eco-leaf rounded-full border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-eco-text/60 hover:text-eco-leaf mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-eco-leaf/20">
            <img
              src={product.image_url || fallbackImage}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackImage;
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            {product.brand && (
              <p className="text-sm text-gray-500 uppercase">{product.brand}</p>
            )}
            <h1 className="text-3xl font-bold text-eco-text mb-2">{product.title}</h1>

            <div className="flex items-center gap-4 mt-2">
              <ConfidenceBadge
                pct={product.confidence_pct ?? 0}
                color={product.confidence_color ?? "yellow"}
              />
              {product.verified_status === "verified" && (
                <div className="flex items-center gap-1 text-eco-leaf text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Vérifié
                </div>
              )}
            </div>
          </div>

          {typeof product.eco_score === "number" && (
            <>
              <EcoScoreBadge
                score={product.eco_score}
                confidenceColor={product.confidence_color}
              />
              <div className="text-xs text-gray-500 mt-2">
                <p className="mb-1 font-medium">🔍 Légende du score écologique :</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li><span className="text-green-600 font-medium">Vert</span> : produit très écoresponsable</li>
                  <li><span className="text-yellow-500 font-medium">Jaune</span> : score modéré</li>
                  <li><span className="text-red-500 font-medium">Rouge</span> : score faible ou à vérifier</li>
                </ul>
              </div>
            </>
          )}

          <p className="text-gray-700">{product.description}</p>

          {product.tags?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Étiquettes</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-eco-leaf/10 border border-eco-leaf/20 text-sm rounded-full text-eco-text"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.resume_fr && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Analyse IA</h4>
                  <p className="text-blue-800 text-sm">{product.resume_fr}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 border-t pt-6">
        <PartnerLinks partnerLinks={product.partnerLinks} productTitle={product.title} />
      </div>

      <div className="mt-12 border-t pt-6">
        <SimilarProductsCarousel productId={product.id} />
      </div>
    </div>
  );
};

export default ProductPage;
