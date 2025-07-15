// PATH: frontend/src/pages/ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface NovaAnalysis {
  level: 1 | 2 | 3 | 4;
  confidence: number;
  reasons: string[];
  penalties: number;
  health_impact: string;
  scientific_sources: string[];
}

interface ApiAnalysisResult {
  success: boolean;
  category: string;
  analysis: {
    overall_score: number;
    nova_analysis?: NovaAnalysis;
    confidence: number;
  };
  recommendations?: {
    message: string;
    alternatives?: string[];
  };
}

interface HealthMetric {
  value: number | string;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  optimal: string;
}

interface Product {
  title: string;
  brand: string;
  description: string;
  ingredients: string[];
  premiumAnalysis: {
    scores: {
      overall: number;
      nutrition: number;
      transformation: number;
      health: number;
      glycemicImpact: number;
    };
    healthMetrics: {
      glycemicIndex: HealthMetric;
      fiberContent: HealthMetric;
      sodiumLevel: HealthMetric;
      additivesCount: HealthMetric;
    };
    nutritionFacts: {
      calories: number;
      protein: number;
      carbs: number;
      fiber: number;
      sugar: number;
      fat: number;
    };
    alternatives: Array<{
      name: string;
      score: number;
      time: string;
      cost: string;
      why: string;
    }>;
  };
  novaAnalysis?: NovaAnalysis;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Composant Badge NOVA
const NovaBadge: React.FC<{ novaLevel: 1 | 2 | 3 | 4; className?: string }> = ({ 
  novaLevel, 
  className = "" 
}) => {
  const getNovaConfig = (level: 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return {
          color: 'bg-green-500',
          textColor: 'text-white',
          icon: '🍎',
          label: 'Naturel'
        };
      case 2:
        return {
          color: 'bg-yellow-500',
          textColor: 'text-white',
          icon: '🥄',
          label: 'Culinaire'
        };
      case 3:
        return {
          color: 'bg-orange-500',
          textColor: 'text-white',
          icon: '⚠️',
          label: 'Transformé'
        };
      case 4:
        return {
          color: 'bg-red-500',
          textColor: 'text-white',
          icon: '🚫',
          label: 'Ultra-transformé'
        };
    }
  };

  const config = getNovaConfig(novaLevel);

  return (
    <div className={`inline-flex items-center space-x-2 ${config.color} rounded-xl px-4 py-2 ${className}`}>
      <span className="text-lg">{config.icon}</span>
      <div className={`${config.textColor}`}>
        <div className="text-sm font-bold">NOVA {novaLevel}</div>
        <div className="text-xs opacity-90">{config.label}</div>
      </div>
    </div>
  );
};

// Composant NOVA Details
const NovaDetails: React.FC<{ novaAnalysis: NovaAnalysis }> = ({ novaAnalysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔬</span>
          <h3 className="text-lg font-bold text-blue-700">Classification NOVA Scientifique</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? '▲ Masquer détails' : '▼ Voir détails'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-sm text-gray-600">Niveau NOVA</div>
          <div className="font-bold text-xl text-blue-600">Groupe {novaAnalysis.level}</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-sm text-gray-600">Confiance IA</div>
          <div className="font-bold text-xl text-blue-600">{Math.round(novaAnalysis.confidence * 100)}%</div>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="text-sm text-gray-600">Impact Score</div>
          <div className="font-bold text-xl text-red-600">{novaAnalysis.penalties} points</div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-blue-700 mb-2">🧬 Raisons de Classification</h4>
            <ul className="space-y-1">
              {novaAnalysis.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-blue-600 flex items-start space-x-2">
                  <span>•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-blue-700 mb-2">🏥 Impact sur la Santé</h4>
            <p className="text-sm text-blue-600 bg-white rounded-lg p-3">
              {novaAnalysis.health_impact}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-blue-700 mb-2">📚 Sources Scientifiques</h4>
            <ul className="space-y-1">
              {novaAnalysis.scientific_sources.map((source, idx) => (
                <li key={idx} className="text-xs text-blue-500 bg-white rounded-lg p-2">
                  📖 {source}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant CircularScoreGauge
const CircularScoreGauge: React.FC<{
  score: number;
  maxScore?: number;
  label?: string;
  color?: string;
  size?: number;
}> = ({ score, maxScore = 100, label = "Score", color = "#7DDE4A", size = 200 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 16) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / maxScore) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E9F8DF"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color }}>
            {animatedScore}
          </div>
          <div className="text-sm text-gray-600">/ {maxScore}</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-800">{label}</div>
      </div>
    </div>
  );
};

// Composant HealthIndicator
const HealthIndicator: React.FC<{
  label: string;
  value: number | string;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  icon: string;
  improvement?: number;
}> = ({ label, value, unit, status, icon, improvement }) => {
  const getStatusColor = (s: 'excellent' | 'good' | 'warning' | 'danger') => {
    switch (s) {
      case 'excellent': return '#7DDE4A';
      case 'good': return '#95D36B';
      case 'warning': return '#FFA726';
      case 'danger': return '#FF7043';
      default: return '#DDE9DA';
    }
  };

  const getBarWidth = (s: 'excellent' | 'good' | 'warning' | 'danger') => {
    switch (s) {
      case 'excellent': return '90%';
      case 'good': return '70%';
      case 'warning': return '45%';
      case 'danger': return '20%';
      default: return '0%';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        {improvement !== undefined && (
          <span
            className="text-sm font-medium"
            style={{ color: improvement > 0 ? '#7DDE4A' : '#FF7043' }}
          >
            {improvement > 0 ? '+' : ''}{improvement}%
          </span>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold" style={{ color: getStatusColor(status) }}>
          {value}
        </span>
        <span className="text-lg text-gray-500">{unit}</span>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{ 
              backgroundColor: getStatusColor(status), 
              width: getBarWidth(status) 
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Composant AlternativeCard
const AlternativeCard: React.FC<{
  alternative: {
    name: string;
    score: number;
    time: string;
    cost: string;
    why: string;
  };
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  currentScore: number;
}> = ({ alternative, index, isSelected, onSelect, currentScore }) => {
  const improvement = alternative.score - currentScore;
  
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('maison')) return '🏠';
    if (n.includes('flocons')) return '🌾';
    if (n.includes('fruits')) return '🍎';
    return '🌱';
  };

  return (
    <div
      className={`bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelected ? 'border-green-400 shadow-xl' : 'border-gray-100 hover:border-green-200 shadow-md'
      }`}
      onClick={() => onSelect(index)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            +{improvement} points
          </div>
          <div className="text-2xl">{getIcon(alternative.name)}</div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">{alternative.name}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-sm text-gray-600 mb-1">⏱️ Temps</div>
            <div className="font-bold text-gray-800">{alternative.time}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-sm text-gray-600 mb-1">💰 Économie</div>
            <div className="font-bold text-green-600">{alternative.cost}</div>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4">{alternative.why}</p>

        {isSelected && (
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-green-700 mb-2">🔬 Bénéfices Santé Prouvés</h4>
              <ul className="text-sm text-green-600 space-y-1">
                {alternative.name.toLowerCase().includes('flocons') && (
                  <>
                    <li>• Index glycémique réduit de 54% (40 vs 87)</li>
                    <li>• Fibres bêta-glucanes -10% cholestérol</li>
                    <li>• Satiété prolongée 4h (vs 1h30)</li>
                  </>
                )}
                {alternative.name.toLowerCase().includes('fruits') && (
                  <>
                    <li>• Classification NOVA 1 (aliment naturel)</li>
                    <li>• Antioxydants naturels préservés</li>
                    <li>• Fibres solubles régulent glycémie</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <span className="text-xs text-gray-400">
            {isSelected ? '▲ Masquer détails' : '▼ Voir bénéfices santé'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Composant principal ProductPage
const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'alternatives'>('overview');
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: "Bonjour ! J'ai analysé ce produit avec notre IA nutritionnelle basée sur la classification NOVA. Que souhaitez-vous savoir sur ses impacts santé ?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Charger et analyser le produit
  useEffect(() => {
    loadAndAnalyzeProduct();
  }, [slug]);

  const loadAndAnalyzeProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simuler produit (en attendant vraie API produits)
      const mockProduct = {
        title: slug ? `Produit: ${slug}` : 'Galettes de Riz Bio Complet',
        brand: 'Nature Bio',
        description: 'Galettes de riz complet biologiques. Analyse nutritionnelle révèle une ultra-transformation malgré le label bio.',
        ingredients: ['riz complet bio', 'sel marin', 'extrusion haute température']
      };

      // Appel API NOVA
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://ecolojia-backend-working.onrender.com';

      const response = await fetch(`${backendUrl}/api/multi-category/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            title: mockProduct.title,
            ingredients: mockProduct.ingredients
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResult: ApiAnalysisResult = await response.json();
      console.log('🔬 Résultat API NOVA:', apiResult);

      // Construire le produit avec analyse NOVA
      const finalScore = apiResult.analysis.overall_score || 35;
      const novaAnalysis = apiResult.analysis.nova_analysis;

      const productData: Product = {
        ...mockProduct,
        premiumAnalysis: {
          scores: {
            overall: finalScore,
            nutrition: 45,
            transformation: novaAnalysis ? (novaAnalysis.level <= 2 ? 85 : 15) : 15,
            health: novaAnalysis ? (novaAnalysis.level <= 2 ? 80 : 25) : 25,
            glycemicImpact: 20
          },
          healthMetrics: {
            glycemicIndex: { value: 87, status: 'danger', optimal: '<55' },
            fiberContent: { value: 2.1, status: 'warning', optimal: '>5g' },
            sodiumLevel: { value: 150, status: 'good', optimal: '<200mg' },
            additivesCount: { value: 0, status: 'excellent', optimal: '0' }
          },
          nutritionFacts: {
            calories: 392,
            protein: 8.2,
            carbs: 81.5,
            fiber: 2.1,
            sugar: 0.9,
            fat: 3.2
          },
          alternatives: [
            {
              name: 'Flocons d\'avoine complets',
              score: 85,
              time: '5 min',
              cost: '-40%',
              why: 'Index glycémique bas (40), riche en fibres bêta-glucanes, classification NOVA 1'
            },
            {
              name: 'Fruits frais + amandes',
              score: 95,
              time: '2 min',
              cost: '-20%',
              why: 'Aliments naturels NOVA 1, antioxydants préservés, satiété optimale'
            }
          ]
        },
        novaAnalysis: novaAnalysis
      };

      setProduct(productData);

    } catch (err) {
      console.error('❌ Erreur chargement produit:', err);
      setError('Erreur lors du chargement du produit');
      
      // Fallback vers données mock
      setProduct({
        title: slug ? `Produit: ${slug}` : 'Galettes de Riz Bio Complet',
        brand: 'Nature Bio',
        description: 'Galettes de riz complet biologiques. Analyse en cours...',
        ingredients: ['riz complet bio', 'sel marin'],
        premiumAnalysis: {
          scores: { overall: 35, nutrition: 45, transformation: 15, health: 25, glycemicImpact: 20 },
          healthMetrics: {
            glycemicIndex: { value: 87, status: 'danger', optimal: '<55' },
            fiberContent: { value: 2.1, status: 'warning', optimal: '>5g' },
            sodiumLevel: { value: 150, status: 'good', optimal: '<200mg' },
            additivesCount: { value: 0, status: 'excellent', optimal: '0' }
          },
          nutritionFacts: { calories: 392, protein: 8.2, carbs: 81.5, fiber: 2.1, sugar: 0.9, fat: 3.2 },
          alternatives: [
            { name: 'Flocons d\'avoine complets', score: 85, time: '5 min', cost: '-40%', why: 'Alternative plus saine' }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHealthResponse = (question: string): string => {
    if (question.toLowerCase().includes('nova')) {
      return `La classification NOVA évalue le degré de transformation :

🔸 **NOVA 1** : Aliments naturels (fruits, légumes, œufs)
🔸 **NOVA 2** : Ingrédients culinaires (huile, sel, sucre)  
🔸 **NOVA 3** : Aliments transformés (conserves, fromages)
🔸 **NOVA 4** : Ultra-transformés (plats préparés, sodas)

${product?.novaAnalysis ? `Ce produit est classé **NOVA ${product.novaAnalysis.level}** avec ${Math.round(product.novaAnalysis.confidence * 100)}% de confiance.` : ''}

Selon l'INSERM 2024, les NOVA 4 augmentent de +31% le risque d'obésité !`;
    }
    
    if (question.toLowerCase().includes('glycémique')) {
      return `L'index glycémique de 87 est préoccupant ! Pour comparaison :
      
🔸 **Ce produit : 87** (très élevé)
🔸 **Riz complet naturel : 50** (modéré)
🔸 **Flocons d'avoine : 40** (bas)

**Impact sur votre santé :**
• Pic de glycémie en 15-30min
• Chute brutale = fringales 2h après
• Stress pancréatique répété
• Risque diabète type 2

**Recommandation :** Privilégier IG < 55 pour une énergie stable.`;
    }
    
    return `Selon l'ANSES et nos analyses nutritionnelles, ce produit nécessite une attention particulière malgré son label bio. L'ultra-transformation altère ses qualités nutritionnelles. Voulez-vous des conseils pour une meilleure alternative ?`;
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateHealthResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">🔬 Analyse NOVA en cours...</h2>
          <p className="text-gray-600">Classification scientifique du produit</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800">❌ Erreur de chargement</h2>
          <p className="text-red-600">{error || 'Produit non trouvé'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">🌱</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ECOLOJIA</span>
            <span className="text-sm text-gray-500">Analyse Nutritionnelle IA</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>IA NOVA Active</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="relative w-80 h-80 mx-auto lg:mx-0 mb-8">
              <div className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100"></div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden p-8 flex items-center justify-center">
                <div className="text-8xl opacity-80">🍘</div>
              </div>
              <div className="absolute -top-4 -right-4 space-y-2">
                <div className="bg-orange-100 border border-orange-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">C</div>
                  <div className="text-xs text-orange-600">Nutri-Score</div>
                </div>
                {product.novaAnalysis && (
                  <NovaBadge novaLevel={product.novaAnalysis.level} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-700 font-medium">Analyse NOVA Scientifique Complète</span>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6">{product.brand}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              
              {/* Affichage NOVA Analysis */}
              {product.novaAnalysis && (
                <NovaDetails novaAnalysis={product.novaAnalysis} />
              )}
            </div>

            <div className="flex justify-center lg:justify-start">
              <CircularScoreGauge 
                score={product.premiumAnalysis.scores.overall}
                label="Score Santé Global"
                color={product.premiumAnalysis.scores.overall >= 70 ? '#7DDE4A' : product.premiumAnalysis.scores.overall >= 40 ? '#FFA726' : '#FF7043'}
              />
            </div>

            {product.novaAnalysis && product.novaAnalysis.level >= 3 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-bold text-red-700">Alerte Transformation Détectée</h3>
                </div>
                <p className="text-red-600 mb-4">
                  {product.novaAnalysis.health_impact}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-bold text-red-600">NOVA {product.novaAnalysis.level}</div>
                    <div className="text-red-500">Ultra-transformé</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-bold text-red-600">{product.novaAnalysis.penalties}</div>
                    <div className="text-red-500">Points pénalité</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100">
            {[
              { id: 'overview', label: 'Analyse NOVA', icon: '🔬' },
              { id: 'nutrition', label: 'Nutrition', icon: '📊' },
              { id: 'alternatives', label: 'Alternatives Saines', icon: '🌱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu des Onglets */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🔬 Indicateurs Santé & Nutrition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HealthIndicator
                  label="Index Glycémique"
                  value={product.premiumAnalysis.healthMetrics.glycemicIndex.value}
                  unit=""
                  status="danger"
                  icon="📈"
                  improvement={-54}
                />
                <HealthIndicator
                  label="Fibres"
                  value={product.premiumAnalysis.healthMetrics.fiberContent.value}
                  unit="g"
                  status="warning"
                  icon="🌾"
                  improvement={140}
                />
                <HealthIndicator
                  label="Sodium"
                  value={product.premiumAnalysis.healthMetrics.sodiumLevel.value}
                  unit="mg"
                  status="good"
                  icon="🧂"
                />
                <HealthIndicator
                  label="Additifs"
                  value={product.premiumAnalysis.healthMetrics.additivesCount.value}
                  unit=""
                  status="excellent"
                  icon="✅"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Assistant Santé & Nutrition NOVA</h3>
                    <p className="text-sm text-gray-600">Expertise ANSES • EFSA • INSERM 2024</p>
                  </div>
                </div>
              </div>

              <div className="h-64 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                    placeholder="Posez votre question sur la classification NOVA..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                  >
                    Envoyer
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Qu\'est-ce que NOVA ?', 'Impact sur la santé', 'Index glycémique'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Valeurs Nutritionnelles (100g)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(product.premiumAnalysis.nutritionFacts).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key === 'calories' ? 'Calories' : 
                       key === 'protein' ? 'Protéines (g)' :
                       key === 'carbs' ? 'Glucides (g)' :
                       key === 'fiber' ? 'Fibres (g)' :
                       key === 'sugar' ? 'Sucres (g)' :
                       'Lipides (g)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affichage détaillé des ingrédients */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🧪 Liste des Ingrédients</h3>
              <div className="space-y-3">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <span className="font-medium text-gray-800">{ingredient}</span>
                    <div className="flex items-center space-x-2">
                      {ingredient.toLowerCase().includes('bio') && (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">BIO</span>
                      )}
                      {ingredient.toLowerCase().includes('e') && ingredient.match(/e\d+/i) && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">ADDITIF</span>
                      )}
                      {ingredient.toLowerCase().includes('extrusion') && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">PROCÉDÉ INDUSTRIEL</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                🌱 Alternatives Plus Saines
              </h2>
              <p className="text-gray-600 text-lg">
                Solutions naturelles pour une meilleure santé basées sur la classification NOVA
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {product.premiumAnalysis.alternatives.map((alternative, index) => (
                <AlternativeCard
                  key={index}
                  alternative={alternative}
                  index={index}
                  isSelected={selectedAlternative === index}
                  onSelect={setSelectedAlternative}
                  currentScore={product.premiumAnalysis.scores.overall}
                />
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎯 Améliorez Votre Santé Dès Aujourd'hui
              </h3>
              <p className="text-gray-600 mb-6">
                Ces alternatives scientifiquement prouvées peuvent réduire votre index glycémique de 54% et améliorer votre bien-être général. Privilégiez les aliments NOVA 1 et 2 !
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">NOVA 1</div>
                  <div className="text-sm text-gray-600">Aliments naturels recommandés</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">-54%</div>
                  <div className="text-sm text-gray-600">Réduction index glycémique</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">+140%</div>
                  <div className="text-sm text-gray-600">Augmentation fibres</div>
                </div>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105">
                🚀 Commencer Ma Transition Santé
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🌱</span>
            </div>
            <span className="text-lg font-bold text-gray-800">ECOLOJIA</span>
          </div>
          <p className="text-sm text-gray-500">
            🤖 Analyse IA basée sur classification NOVA • Données ANSES, EFSA, INSERM 2024 • Votre santé, notre priorité
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
// EOF