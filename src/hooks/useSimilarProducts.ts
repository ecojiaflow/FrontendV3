import { useEffect, useState } from "react";

export interface SimilarProduct {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  eco_score: number;
}

export function useSimilarProducts(productId: string) {
  const [similar, setSimilar] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    if (!productId) return;

    fetch(`${API_BASE_URL}/api/products/${productId}/similar`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(setSimilar)
      .catch((err) => {
        console.error("❌ Erreur suggestions :", err);
        setSimilar([]); // fallback vide
      })
      .finally(() => setLoading(false));
  }, [productId]);

  return { similar, loading };
}
