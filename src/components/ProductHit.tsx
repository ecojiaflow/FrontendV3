import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import EcoScoreBadge from "./EcoScoreBadge";

interface HitProps {
  hit: {
    id: string;
    title: string;
    slug?: string;
    brand?: string;
    image_url?: string;
    eco_score?: number;
    confidence_pct?: number;
    confidence_color?: "green" | "yellow" | "red";
    verified_status?: string;
  };
}

const fallbackImage = "/fallback.png";


const ProductHit: React.FC<HitProps> = ({ hit }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (hit.slug) {
      navigate(`/product/${hit.slug}`);
    } else {
      console.warn("Produit sans slug détecté", hit);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition p-4 flex flex-col gap-3"
    >
      {/* Image produit */}
      <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden border">
        <img
          src={hit.image_url || fallbackImage}
          alt={hit.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1">
        {hit.brand && (
          <p className="text-xs text-gray-500 uppercase">{hit.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-eco-text line-clamp-2">{hit.title}</h3>

        <EcoScoreBadge
          score={hit.eco_score ?? 0}
          confidenceColor={hit.confidence_color}
        />

        {hit.verified_status === "verified" && (
          <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
            <Shield className="w-4 h-4" />
            Vérifié
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHit;
