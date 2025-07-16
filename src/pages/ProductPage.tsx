// PATH: frontend/src/pages/ProductPage.tsx
// ✅ Intègre UltraProcessingPanel avec appel API auto
// ✅ Affiche résultat juste sous le bloc NovaDetails

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NovaBadge from '../components/NovaBadge';
import NovaDetails from '../components/NovaDetails';
import UltraProcessingPanel from '../components/UltraProcessingPanel';

const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<any>(null);
  const [ultraProcessingResult, setUltraProcessingResult] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const mock = {
        title: slug || 'Galette de riz bio',
        ingredients: ['riz complet', 'sucre', 'huile hydrogénée', 'arôme artificiel'],
        nova: 4
      };
      setProduct(mock);
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    const analyzeUltra = async () => {
      if (!product?.ingredients) return;

      try {
        const res = await fetch('http://localhost:3000/api/multi-category/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product })
        });

        const data = await res.json();
        if (data.success) {
          setUltraProcessingResult(data.ultraProcessing);
        }
      } catch (err) {
        console.error('❌ Erreur API ultra-processing:', err);
      }
    };

    analyzeUltra();
  }, [product]);

  if (!product) return <div className="p-6">Chargement du produit...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{product.title}</h1>

      <NovaBadge novaLevel={product.nova} />
      <NovaDetails novaAnalysis={{
        level: product.nova,
        confidence: 0.92,
        reasons: ['Présence d’huile hydrogénée', 'Arômes artificiels'],
        penalties: 30,
        health_impact: 'Risque accru de diabète type 2 selon INSERM',
        scientific_sources: ['INSERM 2024', 'EFSA 2023']
      }} />

      {/* ✅ Affiche l'analyse IA UltraProcessing */}
      {ultraProcessingResult && (
        <UltraProcessingPanel result={ultraProcessingResult} />
      )}
    </div>
  );
};

export default ProductPage;
// EOF
