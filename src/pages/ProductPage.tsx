// frontend/src/pages/ProductPage.jsx - Version Enhanced avec tous les composants

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// 🆕 Imports des nouveaux composants révolutionnaires
import NovaClassificationBadge from '../components/NovaClassificationBadge';
import ScoreComparison from '../components/ScoreComparison';
import UltraProcessingAlert from '../components/UltraProcessingAlert';
import NaturalAlternatives from '../components/NaturalAlternatives';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Remplacez par votre URL API
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Erreur chargement produit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600">Le produit demandé n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  // 🆕 Simulation données révolutionnaires (à remplacer par vraies données API)
  const mockRevolutionaryData = {
    score: {
      overall: product.eco_score ? Math.round(product.eco_score * 100) : 65,
      comparison: {
        vsYuka: {
          difference: -10,
          yukaEstimated: 75
        }
      }
    },
    scientificAnalysis: {
      nova: {
        novaGroup: 3, // À récupérer de votre API
        groupInfo: {
          name: "Aliments transformés",
          description: "Aliments du groupe 1 auxquels sont ajoutés des ingrédients culinaires"
        },
        healthImpact: {
          level: 'moderate',
          risks: ['Sodium élevé possible', 'Conservateurs']
        }
      },
      additives: [
        { code: 'E471', name: 'Mono- et diglycérides' },
        { code: 'E330', name: 'Acide citrique' }
      ]
    },
    alternatives: [
      {
        name: "Version fait maison",
        type: "diy",
        difficulty: "moyen",
        time: "25 minutes",
        why_better: "Contrôle total des ingrédients, zéro additifs, fraîcheur maximale et coût réduit de 60%",
        nutritional_advantage: "Nutriments préservés, pas d'ultra-transformation, fibres naturelles maintenues",
        cost_comparison: "-60% vs produit industriel",
        environmental_benefit: "Emballage minimal, ingrédients locaux possibles, transport réduit",
        sources: ["Nutrition Reviews 2024", "Home Cooking Benefits Study"],
        confidence: "high",
        recipe_link: "/recettes/version-maison"
      },
      {
        name: "Alternative bio artisanale",
        type: "substitute", 
        difficulty: "facile",
        time: "Aucune différence",
        why_better: "Même usage, transformation minimale, ingrédients de qualité supérieure",
        nutritional_advantage: "Classification NOVA 2, moins d'additifs, matières premières de qualité",
        cost_comparison: "+20% mais qualité nutritionnelle supérieure",
        environmental_benefit: "Circuit court, agriculture biologique, emballage recyclable",
        sources: ["ANSES Bio Quality Report 2024"],
        confidence: "high"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Produit */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Image Produit */}
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                {product.images && product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-6xl">📦</div>
                )}
              </div>
            </div>

            {/* Informations Produit */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              
              {product.brand && (
                <p className="text-lg text-gray-600 mb-4">
                  Marque : {product.brand}
                </p>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category || 'alimentaire'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Score éthique: {product.eco_score ? `${Math.round(product.eco_score * 100)}/100` : '0.8/5'}
                </span>
                <span className="text-sm text-gray-500">
                  Analysé le {new Date(product.updated_at || Date.now()).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {product.description || product.resume_fr || 'Description du produit non disponible.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Onglets */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'description', label: 'Description', icon: '📝' },
              { id: 'score', label: 'Score Éthique', icon: '📊' },
              { id: 'analyse-ia', label: 'Analyse IA', icon: '🔬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des Onglets */}
        {activeTab === 'description' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description || product.resume_fr || 'Aucune description disponible.'}
            </p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'score' && (
          <div className="space-y-6">
            {/* Score Éthique Existant */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Score Éthique</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {product.eco_score ? `${Math.round(product.eco_score * 100)}/100` : '65/100'}
                </div>
                <p className="text-gray-600">Score écologique global</p>
                
                {/* Breakdown existant */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">0/100</div>
                    <div className="text-sm text-gray-600">Transformation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-pink-600">0/100</div>
                    <div className="text-sm text-gray-600">Nutrition</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">0/100</div>
                    <div className="text-sm text-gray-600">Glycémique</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">0/100</div>
                    <div className="text-sm text-gray-600">Environmental</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyse-ia' && (
          <div className="space-y-6">
            {/* 🆕 SECTION ANALYSE RÉVOLUTIONNAIRE */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800 mb-2">
                  🔬 Analyse Scientifique IA
                </h2>
                <p className="text-purple-600">
                  Analyse basée sur INSERM • ANSES • EFSA 2024
                </p>
              </div>

              {/* 🆕 SCORE COMPARAISON */}
              <ScoreComparison
                ecoloJiaScore={mockRevolutionaryData.score.overall}
                yukaEstimatedScore={mockRevolutionaryData.score.comparison.vsYuka.yukaEstimated}
                difference={mockRevolutionaryData.score.comparison.vsYuka.difference}
              />

              {/* 🆕 BADGE CLASSIFICATION NOVA */}
              <NovaClassificationBadge
                novaGroup={mockRevolutionaryData.scientificAnalysis.nova.novaGroup}
                groupInfo={mockRevolutionaryData.scientificAnalysis.nova.groupInfo}
                healthImpact={mockRevolutionaryData.scientificAnalysis.nova.healthImpact}
              />

              {/* 🆕 ALERTE ULTRA-TRANSFORMATION */}
              <UltraProcessingAlert
                novaGroup={mockRevolutionaryData.scientificAnalysis.nova.novaGroup}
                additives={mockRevolutionaryData.scientificAnalysis.additives}
                healthImpact={mockRevolutionaryData.scientificAnalysis.nova.healthImpact}
              />

              {/* 🆕 ALTERNATIVES NATURELLES */}
              <NaturalAlternatives
                alternatives={mockRevolutionaryData.alternatives}
                productType={product.category}
                novaGroup={mockRevolutionaryData.scientificAnalysis.nova.novaGroup}
              />

              {/* Assistant IA Existant */}
              <div className="bg-blue-50 rounded-lg p-6 mt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Assistant IA Scientifique
                  </h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Analyse basée sur INSERM • ANSES • EFSA 2024
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Marques recommandées dans cette catégorie
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-sm">Cosmétique & Détergents</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        Analyse INCI complète de ce cosmétique
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        Ingrédients controversés détectés
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🆕 BOUTON CHAT IA */}
                <div className="mt-4 text-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    💬 Poser une question sur ce produit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🆕 BOUTON RE-ANALYSER */}
        <div className="text-center mt-8">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center space-x-2 mx-auto">
            <span>🔄</span>
            <span>Re-analyser (7 restants)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;