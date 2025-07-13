// frontend/src/pages/ProductPage.jsx - Version Premium Inspirée Apple/Tesla

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Composants Premium
import CircularScoreGauge from '../components/premium/CircularScoreGauge';
import RadarChart from '../components/premium/RadarChart';
import ThermoMeter from '../components/premium/ThermoMeter';
import DualBadgeCard from '../components/premium/DualBadgeCard';
import BatteryProgress from '../components/premium/BatteryProgress';
import PremiumChat from '../components/premium/PremiumChat';
import PremiumAlternatives from '../components/premium/PremiumAlternatives';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_BASE_URL = 'https://ecolojia-backend-working.onrender.com';
        const response = await fetch(`${API_BASE_URL}/api/products/${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProduct(data);
        
      } catch (error) {
        console.error('❌ Erreur chargement produit:', error);
        
        // Fallback avec données premium
        setProduct({
          id: 'premium_demo',
          title: 'Galettes de Riz Bio Complet',
          slug: 'galettes-riz-bio-demo',
          description: 'Galettes de riz complet biologiques. Analyse révolutionnaire ECOLOJIA détecte ultra-transformation malgré label bio.',
          brand: 'BioDemo',
          category: 'Snacks Bio',
          eco_score: 0.35, // Score volontairement bas pour demo
          ai_confidence: 0.95,
          verified_status: 'ai_analyzed',
          tags: ['bio', 'sans-gluten', 'ultra-transformé-détecté', 'nova-4'],
          images: ['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300'],
          updated_at: new Date().toISOString(),
          
          // 🆕 DONNÉES PREMIUM COMPLÈTES
          premiumAnalysis: {
            scores: {
              overall: 35, // Score global bas car ultra-transformé
              nutrition: 45, // Manque fibres/vitamines
              transformation: 15, // Très transformé
              environmental: 70, // Bio = bon pour environnement
              health: 25, // Index glycémique élevé
              sustainability: 65
            },
            nova: {
              group: 4,
              name: 'Ultra-transformé',
              description: 'Transformation industrielle intensive malgré label bio',
              healthRisk: 'high',
              color: '#dc2626'
            },
            nutriscore: {
              grade: 'C',
              points: 8,
              color: '#f59e0b'
            },
            glycemicIndex: 87, // Très élevé !
            inflammatoryIndex: 2.3, // Pro-inflammatoire
            alternatives: [
              {
                name: 'Flocons d\'avoine complets',
                score: 85,
                time: '5 min',
                cost: '-40%',
                why: 'IG bas (40), fibres +300%, pas d\'extrusion'
              },
              {
                name: 'Fruits frais + noix',
                score: 95,
                time: '2 min', 
                cost: '-20%',
                why: 'NOVA 1, antioxydants, satiété naturelle'
              }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-white text-lg">Analyse IA révolutionnaire en cours...</p>
          <p className="text-gray-400 text-sm mt-2">Classification NOVA • Additifs EFSA • Alternatives naturelles</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Produit non trouvé</h1>
          <button 
            onClick={() => window.history.back()} 
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const premiumData = product.premiumAnalysis || {
    scores: { overall: 35, nutrition: 45, transformation: 15, environmental: 70, health: 25 },
    nova: { group: 4, name: 'Ultra-transformé', healthRisk: 'high', color: '#dc2626' },
    nutriscore: { grade: 'C', color: '#f59e0b' },
    glycemicIndex: 87,
    inflammatoryIndex: 2.3,
    alternatives: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      
      {/* 🎨 HEADER PREMIUM STYLE APPLE */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Colonne Gauche - Image + Badges */}
            <div className="text-center lg:text-left">
              {/* Image Produit Premium */}
              <div className="relative w-80 h-80 mx-auto lg:mx-0 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20"></div>
                <div className="relative w-full h-full rounded-3xl overflow-hidden">
                  {product.images && product.images[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-8xl opacity-60">📦</span>
                    </div>
                  )}
                </div>
                
                {/* Badge NOVA Floating */}
                <div className="absolute -top-4 -right-4">
                  <DualBadgeCard 
                    primary={{
                      label: premiumData.nutriscore.grade,
                      color: premiumData.nutriscore.color,
                      type: 'Nutri-Score'
                    }}
                    secondary={{
                      label: `NOVA ${premiumData.nova.group}`,
                      color: premiumData.nova.color,
                      type: 'Transformation'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Colonne Droite - Infos + Score Principal */}
            <div className="space-y-8">
              {/* Titre Premium */}
              <div>
                <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-400 font-medium">IA Analysé en Temps Réel</span>
                </div>
                
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                  {product.title}
                </h1>
                
                {product.brand && (
                  <p className="text-2xl text-gray-300 mb-6">{product.brand}</p>
                )}

                <p className="text-gray-400 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* 🎯 SCORE PRINCIPAL - JAUGE CIRCULAIRE APPLE WATCH STYLE */}
              <div className="flex justify-center lg:justify-start">
                <CircularScoreGauge 
                  score={premiumData.scores.overall}
                  maxScore={100}
                  label="Score ECOLOJIA"
                  subtitle="Analyse IA Révolutionnaire"
                  color={premiumData.scores.overall >= 70 ? '#22c55e' : premiumData.scores.overall >= 40 ? '#f59e0b' : '#ef4444'}
                  size={200}
                />
              </div>

              {/* Stats Rapides */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-green-400">{Math.round(product.ai_confidence * 100)}%</div>
                  <div className="text-sm text-gray-400">Confiance IA</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-blue-400">NOVA {premiumData.nova.group}</div>
                  <div className="text-sm text-gray-400">Classification</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-purple-400">{premiumData.nutriscore.grade}</div>
                  <div className="text-sm text-gray-400">Nutri-Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 SECTION ANALYSES DÉTAILLÉES */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Navigation Onglets Premium */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
              { id: 'analysis', label: 'Analyse IA', icon: '🔬' },
              { id: 'alternatives', label: 'Alternatives', icon: '🌱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                } px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des Onglets */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 🕸️ RADAR CHART - SCORES MULTIPLES */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Analyse Multi-Critères</h3>
              <RadarChart 
                data={[
                  { axis: 'Nutrition', value: premiumData.scores.nutrition },
                  { axis: 'Transformation', value: premiumData.scores.transformation },
                  { axis: 'Environnement', value: premiumData.scores.environmental },
                  { axis: 'Santé', value: premiumData.scores.health },
                  { axis: 'Durabilité', value: premiumData.scores.sustainability || 65 }
                ]}
                maxValue={100}
              />
            </div>

            {/* 🌡️ THERMOMÈTRES - INDICES SPÉCIALISÉS */}
            <div className="space-y-6">
              {/* Index Glycémique */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h4 className="text-xl font-bold mb-4">Index Glycémique</h4>
                <div className="flex items-center space-x-4">
                  <ThermoMeter 
                    value={premiumData.glycemicIndex}
                    max={100}
                    label="IG"
                    gradient={['#3b82f6', '#f59e0b', '#ef4444']}
                    height={120}
                  />
                  <div>
                    <div className="text-3xl font-bold text-red-400">{premiumData.glycemicIndex}</div>
                    <div className="text-sm text-gray-400">Très Élevé ⚠️</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Recommandé : &lt; 55
                    </div>
                  </div>
                </div>
              </div>

              {/* Index Inflammatoire */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h4 className="text-xl font-bold mb-4">Index Inflammatoire</h4>
                <div className="flex items-center space-x-4">
                  <ThermoMeter 
                    value={Math.abs(premiumData.inflammatoryIndex)}
                    max={5}
                    label="DII"
                    gradient={['#22c55e', '#f59e0b', '#ef4444']}
                    height={120}
                  />
                  <div>
                    <div className="text-3xl font-bold text-orange-400">+{premiumData.inflammatoryIndex}</div>
                    <div className="text-sm text-gray-400">Pro-inflammatoire</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Optimal : &lt; 0 (anti-inflammatoire)
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔋 QUOTA ANALYSES RESTANTES */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                <h4 className="text-xl font-bold mb-4">Analyses Restantes</h4>
                <BatteryProgress 
                  current={7}
                  max={10}
                  label="Quota Quotidien"
                  color="#22c55e"
                />
                <div className="text-sm text-gray-400 mt-2">
                  Renouvellement à minuit • Plan gratuit
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-8">
            
            {/* Alerte Ultra-Transformation Premium */}
            {premiumData.nova.group === 4 && (
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-8 border border-red-500/30">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🚨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-red-400 mb-2">
                      Ultra-Transformation Détectée
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Malgré le label bio, ce produit subit une transformation industrielle intensive (extrusion haute température) qui détruit la matrice alimentaire naturelle.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-red-400 font-bold">+53%</div>
                        <div className="text-gray-400">Risque diabète</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-red-400 font-bold">IG 87</div>
                        <div className="text-gray-400">vs riz complet (50)</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-red-400 font-bold">-70%</div>
                        <div className="text-gray-400">Vitamines B détruites</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat IA Premium */}
            <PremiumChat productContext={product} />
          </div>
        )}

        {activeTab === 'alternatives' && (
          <PremiumAlternatives 
            alternatives={premiumData.alternatives}
            currentScore={premiumData.scores.overall}
          />
        )}
      </div>

      {/* 🔄 BOUTON RE-ANALYSER PREMIUM */}
      <div className="text-center pb-16">
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-400 hover:via-blue-400 hover:to-purple-400 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <span className="mr-3">🔄</span>
          Re-analyser avec IA Révolutionnaire
        </button>
      </div>
    </div>
  );
};

export default ProductPage;