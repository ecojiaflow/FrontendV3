// src/pages/CosmeticDemo.tsx
// -----------------------------------------------------------------------------
// Page de démonstration “Cosmétiques” – 6 produits + analyse INCI “NOVA”
// Utilise le hook `useNovaApi.ts` déjà présent dans le projet.           🪄
// -----------------------------------------------------------------------------

import React, { useState } from 'react';
import { Loader2, FlaskConical, Droplets, ShieldCheck } from 'lucide-react';
import useNovaApi from '../hooks/useNovaApi';

interface DemoProduct {
  id: string;
  emoji: string;
  title: string;
  brand: string;
  description: string;
  ingredients: string[];
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'shampoo_sls',
    emoji: '🧴',
    title: 'Shampoing Doux Bio',
    brand: 'Cosmébio',
    description: 'Shampoing “doux” mais contenant SLS + parfum synthétique.',
    ingredients: [
      'aqua',
      'sodium lauryl sulfate',
      'coco-glucoside',
      'parfum',
      'limonene',
    ],
  },
  {
    id: 'cream_paraben',
    emoji: '🧴',
    title: 'Crème Hydratante',
    brand: 'Dermosoft',
    description: 'Crème visage avec parabens et silicone.',
    ingredients: ['aqua', 'paraffinum liquidum', 'methylparaben', 'dimethicone'],
  },
  {
    id: 'toothpaste_fluoride',
    emoji: '🪥',
    title: 'Dentifrice Fraîcheur',
    brand: 'WhiteSmile',
    description: 'Contient SLS + dioxyde de titane.',
    ingredients: [
      'sorbitol',
      'hydrated silica',
      'sodium lauryl sulfate',
      'titanium dioxide',
    ],
  },
  {
    id: 'deodorant_aluminium',
    emoji: '🧼',
    title: 'Déodorant 48 h',
    brand: 'FreshAir',
    description: 'Sels d’aluminium + parfum de synthèse.',
    ingredients: [
      'aqua',
      'aluminium chlorohydrate',
      'parfum',
      'propylene glycol',
    ],
  },
  {
    id: 'lipstick_carmin',
    emoji: '💄',
    title: 'Rouge à Lèvres Intense',
    brand: 'GlamUp',
    description: 'Pigments azoïques + parfum.',
    ingredients: ['ricinus communis', 'CI 15850', 'parfum', 'tocopherol'],
  },
  {
    id: 'soap_natural',
    emoji: '🧼',
    title: 'Savon Surgras Nature',
    brand: 'GreenSoap',
    description: '99 % d’origine naturelle – produit “saine référence”.',
    ingredients: ['olea europaea', 'cocos nucifera', 'aqua', 'sodium hydroxide'],
  },
];

const CosmeticDemo: React.FC = () => {
  // Hook d’appel API
  const { analyzeProduct, loading, result, error } = useNovaApi('cosmetics');

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAnalyze = async (product: DemoProduct) => {
    setSelectedId(product.id);
    await analyzeProduct({
      title: product.title,
      brand: product.brand,
      description: product.description,
      ingredients: product.ingredients,
      category: 'cosmetics',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-pink-600 mb-4 flex items-center justify-center gap-2">
            <FlaskConical className="w-10 h-10" /> Demo — Analyse Cosmétiques
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sélectionnez l’un des six produits ci-dessous pour lancer
            l’analyse&nbsp;INCI (sécurité – perturbateurs endocriniens –
            allergènes).
          </p>
        </header>

        {/* Grille produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEMO_PRODUCTS.map((prod) => {
            const isRunning = loading && selectedId === prod.id;
            const isDone =
              result && selectedId === prod.id && !loading && !error;

            return (
              <div
                key={prod.id}
                className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all p-6 flex flex-col"
              >
                <div className="text-6xl mb-4 text-center">{prod.emoji}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {prod.title}
                </h3>
                <p className="text-sm text-pink-600 mb-4">{prod.brand}</p>
                <p className="text-gray-600 text-sm flex-1">
                  {prod.description}
                </p>

                <button
                  disabled={loading}
                  onClick={() => handleAnalyze(prod)}
                  className="mt-6 w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isRunning ? 'Analyse…' : 'Analyser'}
                </button>

                {/* Résultat rapide */}
                {isDone && result && (
                  <div className="mt-4 bg-pink-50 border border-pink-200 rounded-xl p-4 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-pink-700">
                      <ShieldCheck className="w-5 h-5" />
                      Score sécurité : {result.analysis?.overall_score ?? '--'}/
                      100
                    </div>
                    <div className="text-xs text-pink-600">
                      Confiance&nbsp;IA :{' '}
                      {Math.round(
                        (result.detection_confidence ?? 0) * 100
                      )}
                      %
                    </div>
                  </div>
                )}

                {selectedId === prod.id && error && (
                  <p className="mt-4 text-sm text-red-600 text-center">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Explications */}
        <section className="mt-16 bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-pink-500" /> Que fait l’algorithme
            ?
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>
              Parse la liste INCI pour détecter&nbsp;:
              <ul className="list-[circle] ml-5">
                <li>• perturbateurs endocriniens</li>
                <li>• allergènes de contact</li>
                <li>• conservateurs controversés (parabènes…)</li>
              </ul>
            </li>
            <li>Calcule un score de sécurité (0–100)</li>
            <li>Suggère des alternatives plus saines si nécessaire</li>
            <li>Fonctionne hors-ligne grâce au mode “mock” fallback</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CosmeticDemo;

// EOF
