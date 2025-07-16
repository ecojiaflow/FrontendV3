// PATH: frontend/src/pages/CosmeticDemo.tsx
import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { useNovaApi } from '../hooks/useNovaApi';            // ⬅️  Import nommé, plus “default”
import LoadingSpinner from '../components/LoadingSpinner';

interface DemoProduct {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  ingredients: string[];
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'shampoo_bio',
    name: 'Shampoing Doux Bio',
    brand: 'CosméBio',
    emoji: '🧴',
    ingredients: ['aqua', 'sodium lauryl sulfate', 'parfum', 'glycerin'],
  },
  {
    id: 'face_cream',
    name: 'Crème Visage Hydratante',
    brand: 'GreenSkin',
    emoji: '🧴',
    ingredients: ['aqua', 'cetearyl alcohol', 'phenoxyethanol', 'aloe vera'],
  },
  {
    id: 'lipstick',
    name: 'Rouge à Lèvres Naturel',
    brand: 'BioChic',
    emoji: '💄',
    ingredients: ['ricinus communis', 'cera alba', 'parfum'],
  },
  {
    id: 'deodorant',
    name: 'Déodorant Solide',
    brand: 'EcoFresh',
    emoji: '🧼',
    ingredients: ['sodium bicarbonate', 'cocos nucifera', 'limonene'],
  },
  {
    id: 'body_lotion',
    name: 'Lotion Corps',
    brand: 'PureSkin',
    emoji: '🧴',
    ingredients: ['aqua', 'paraffinum liquidum', 'parfum'],
  },
  {
    id: 'hair_oil',
    name: 'Huile Cheveux',
    brand: 'NatureHair',
    emoji: '🌿',
    ingredients: ['argania spinosa', 'tocopherol'],
  },
];

const CosmeticDemo: React.FC = () => {
  const { analyze, loading, error, result } = useNovaApi();   // hook existant
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null);

  const handleAnalyze = (product: DemoProduct) => {
    setSelectedProduct(product);
    analyze({
      detected_type: 'cosmetic',
      title: product.name,
      brand: product.brand,
      ingredients: product.ingredients,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <header className="py-10 text-center">
        <Leaf className="h-12 w-12 text-pink-600 inline-block" />
        <h1 className="text-4xl font-bold text-pink-700 mt-2">Démo Cosmétique</h1>
        <p className="text-pink-600 mt-2">
          Analysez 6 produits cosmétiques réalistes avec notre IA
        </p>
      </header>

      <section className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleAnalyze(p)}
            className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition ${
              selectedProduct?.id === p.id ? 'border-2 border-pink-500' : ''
            }`}
          >
            <div className="text-5xl mb-4">{p.emoji}</div>
            <h3 className="font-semibold text-lg text-gray-800">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.brand}</p>
          </button>
        ))}
      </section>

      {/* Résultats */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        {loading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {result && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-pink-700 mb-4">
              Résultats pour {selectedProduct?.name}
            </h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default CosmeticDemo;
// EOF
