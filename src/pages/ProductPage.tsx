// ProductPage.jsx - Version Claire avec Charte ECOLOJIA + Focus Santé/Nutrition
// En haut du fichier ProductPage.jsx
import HealthIndicator from '../components/HealthIndicator';
import AlternativeCard from '../components/AlternativeCard';
import CircularScoreGaugeLight from '../components/CircularScoreGaugeLight';
import React, { useState, useEffect } from 'react';

// Composants Premium adaptés
const CircularScoreGauge = ({ score, maxScore = 100, label = "Score", color = "#7DDE4A", size = 200 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    setTimeout(() => setAnimatedScore(score), 100);
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

const HealthIndicator = ({ label, value, unit, status, icon, improvement }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#7DDE4A';
      case 'good': return '#95D36B';
      case 'warning': return '#FFA726';
      case 'danger': return '#FF7043';
      default: return '#DDE9DA';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        {improvement && (
          <span className="text-sm font-medium" style={{ color: improvement > 0 ? '#7DDE4A' : '#FF7043' }}>
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
              width: status === 'excellent' ? '90%' : status === 'good' ? '70%' : status === 'warning' ? '45%' : '20%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AlternativeCard = ({ alternative, index, isSelected, onSelect, currentScore }) => {
  const improvement = alternative.score - currentScore;
  
  return (
    <div 
      className={`bg-white rounded-3xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelected ? 'border-green-400 shadow-xl' : 'border-gray-100 hover:border-green-200 shadow-md'
      }`}
      onClick={() => onSelect(index)}
    >
      <div className="p-6">
        {/* Badge amélioration */}
        <div className="flex justify-between items-start mb-4">
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            +{improvement} points
          </div>
          <div className="text-2xl">
            {alternative.name.includes('maison') ? '🏠' : 
             alternative.name.includes('flocons') ? '🌾' : 
             alternative.name.includes('fruits') ? '🍎' : '🌱'}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">{alternative.name}</h3>
        
        {/* Métriques */}
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
                {alternative.name.includes('flocons') && (
                  <>
                    <li>• Index glycémique réduit de 54% (40 vs 87)</li>
                    <li>• Fibres bêta-glucanes -10% cholestérol</li>
                    <li>• Satiété prolongée 4h (vs 1h30)</li>
                  </>
                )}
                {alternative.name.includes('fruits') && (
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

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Bonjour ! J'ai analysé ce produit avec notre IA nutritionnelle. Ce produit présente un index glycémique élevé malgré son label bio. Que souhaitez-vous savoir sur ses impacts santé ?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Données du produit avec focus santé/nutrition
  const product = {
    title: 'Galettes de Riz Bio Complet',
    brand: 'Nature Bio',
    description: 'Galettes de riz complet biologiques. Analyse nutritionnelle révèle une ultra-transformation malgré le label bio.',
    premiumAnalysis: {
      scores: {
        overall: 35,
        nutrition: 45,
        transformation: 15,
        health: 25,
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
          why: 'Index glycémique bas (40), riche en fibres bêta-glucanes, pas d\'extrusion industrielle'
        },
        {
          name: 'Fruits frais + amandes',
          score: 95,
          time: '2 min',
          cost: '-20%',
          why: 'Aliments naturels NOVA 1, antioxydants préservés, satiété optimale'
        }
      ]
    }
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Réponse IA simulée
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateHealthResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateHealthResponse = (question) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      
      {/* Header avec logo discret */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo ECOLOJIA discret */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C8.8 9 8.6 9 8.4 9.1L7 9.5C6.6 9.6 6.3 9.9 6.1 10.3L4.1 14.1C4 14.4 4 14.8 4.2 15.1C4.4 15.4 4.7 15.6 5 15.7L7.6 16.3C7.9 16.4 8.2 16.2 8.3 15.9L9 13.4L12 13.8L15 13.4L15.7 15.9C15.8 16.2 16.1 16.4 16.4 16.3L19 15.7C19.3 15.6 19.6 15.4 19.8 15.1C20 14.8 20 14.4 19.9 14.1L17.9 10.3C17.7 9.9 17.4 9.6 17 9.5L15.6 9.1C15.4 9 15.2 9 15 9Z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">ECOLOJIA</span>
            <span className="text-sm text-gray-500">Analyse Nutritionnelle IA</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>IA Santé Active</span>
          </div>
        </div>
      </div>

      {/* Section Hero - Design clair et santé */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Colonne Gauche - Image + Badges santé */}
          <div className="text-center lg:text-left">
            <div className="relative w-80 h-80 mx-auto lg:mx-0 mb-8">
              <div className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100"></div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden p-8 flex items-center justify-center">
                <div className="text-8xl opacity-80">🍘</div>
              </div>
              
              {/* Badges Nutrition */}
              <div className="absolute -top-4 -right-4 space-y-2">
                <div className="bg-orange-100 border border-orange-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">C</div>
                  <div className="text-xs text-orange-600">Nutri-Score</div>
                </div>
                <div className="bg-red-100 border border-red-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-red-600">4</div>
                  <div className="text-xs text-red-600">NOVA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite - Infos santé */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-700 font-medium">Analyse Nutritionnelle Complète</span>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6">{product.brand}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Score Principal - Style santé */}
            <div className="flex justify-center lg:justify-start">
              <CircularScoreGauge 
                score={product.premiumAnalysis.scores.overall}
                label="Score Santé Global"
                color={product.premiumAnalysis.scores.overall >= 70 ? '#7DDE4A' : product.premiumAnalysis.scores.overall >= 40 ? '#FFA726' : '#FF7043'}
              />
            </div>

            {/* Alertes Santé */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-700">Alerte Santé Détectée</h3>
              </div>
              <p className="text-red-600 mb-4">
                Index glycémique très élevé (87) malgré le label bio. Risque de pic glycémique important.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-red-600">+53%</div>
                  <div className="text-red-500">Risque diabète</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-bold text-red-600">87</div>
                  <div className="text-red-500">Index glycémique</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Onglets - Style clair */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-2 shadow-md border border-gray-100">
            {[
              { id: 'overview', label: 'Analyse Santé', icon: '🔬' },
              { id: 'nutrition', label: 'Nutrition', icon: '📊' },
              { id: 'alternatives', label: 'Alternatives Saines', icon: '🌱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                } px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2`}
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
            
            {/* Métriques Santé */}
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
                  improvement={+140}
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

            {/* Chat IA Santé */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Assistant Santé & Nutrition</h3>
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
                    placeholder="Posez votre question sur les impacts santé..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                  >
                    Envoyer
                  </button>
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
          </div>
        )}

        {activeTab === 'alternatives' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                🌱 Alternatives Plus Saines
              </h2>
              <p className="text-gray-600 text-lg">
                Solutions naturelles pour une meilleure santé
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

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎯 Améliorez Votre Santé Dès Aujourd'hui
              </h3>
              <p className="text-gray-600 mb-6">
                Ces alternatives scientifiquement prouvées peuvent réduire votre index glycémique de 54% et améliorer votre bien-être général.
              </p>
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105">
                🚀 Commencer Ma Transition Santé
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec logo */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800">ECOLOJIA</span>
          </div>
          <p className="text-sm text-gray-500">
            🤖 Analyse IA basée sur données ANSES, EFSA, INSERM 2024 • Votre santé, notre priorité
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;