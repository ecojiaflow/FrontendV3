import React from "react";
import { Link } from "react-router-dom";
import { useSimilarProducts } from "../hooks/useSimilarProducts";

interface Props {
  productId: string;
}

const SimilarProductsCarousel: React.FC<Props> = ({ productId }) => {
  const { similar, loading } = useSimilarProducts(productId);

  if (loading) {
    return <p className="text-sm text-gray-500">Chargement des suggestions...</p>;
  }

  if (!similar.length) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-eco-text mb-3">Produits similaires</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {similar.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.slug}`}
            className="min-w-[180px] flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow p-3 hover:shadow-md transition"
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-32 object-cover rounded"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                Pas d’image
              </div>
            )}
            <p className="mt-2 font-medium text-sm">{product.title}</p>
            <p className="text-green-600 text-xs">
              Éco-score : {Math.round(product.eco_score * 100)}%
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SimilarProductsCarousel;
