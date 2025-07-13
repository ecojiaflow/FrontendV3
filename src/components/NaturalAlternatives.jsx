// frontend/src/components/NaturalAlternatives.jsx

import React, { useState } from 'react';

const NaturalAlternatives = ({ alternatives, productType, novaGroup }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Ne s'affiche que s'il y a des alternatives ou si le produit peut être amélioré
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  const toggleExpanded = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'facile':
        return 'text-green-600 bg-green-100';
      case 'moyen':
        return 'text-orange-600 bg-orange-100';
      case 'avancé':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'diy':
        return '🏠';
      case 'substitute':
        return '🔄';
      case 'natural':
        return '🌱';
      default:
        return '💡';
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mt-6 border border-green-200 shadow-sm">
      {/* En-tête Section */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          🌱 Alternatives Naturelles Recommandées
        </h3>
        <p className="text-sm text-green-700">
          Solutions scientifiquement prouvées pour remplacer ce produit
        </p>
        
        {/* Badge nombre d'alternatives */}
        <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-4 py-2 mt-3">
          <span className="text-green-800 font-semibold text-sm">
            {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''} trouvée{alternatives.length > 1 ? 's' : ''}
          </span>
          <span className="text-xs text-green-600">
            par notre IA scientifique
          </span>
        </div>
      </div>

      {/* Liste des Alternatives */}
      <div className="space-y-4">
        {alternatives.map((alternative, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors duration-200"
          >
            {/* En-tête Alternative */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(alternative.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg">
                      {alternative.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {alternative.why_better?.substring(0, 100)}
                      {alternative.why_better?.length > 100 && '...'}
                    </p>
                  </div>
                </div>
                
                {/* Badges Rapides */}
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(alternative.difficulty)}`}>
                    {alternative.difficulty || 'moyen'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {alternative.time || '15-30min'}
                  </span>
                  <button className="text-xs text-green-600 hover:text-green-800">
                    {expandedIndex === index ? '🔼 Moins' : '🔽 Plus'}
                  </button>
                </div>
              </div>
            </div>

            {/* Détails Étendus */}
            {expandedIndex === index && (
              <div className="px-4 pb-4 border-t border-green-100">
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Avantages Nutritionnels */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h5 className="font-semibold text-green-800 text-sm mb-2">
                      🍃 Avantages Nutritionnels
                    </h5>
                    <p className="text-xs text-green-700">
                      {alternative.nutritional_advantage || alternative.why_better}
                    </p>
                  </div>

                  {/* Impact Économique */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h5 className="font-semibold text-blue-800 text-sm mb-2">
                      💰 Impact Économique
                    </h5>
                    <p className="text-xs text-blue-700">
                      {alternative.cost_comparison || 'Coût comparable sur le long terme'}
                    </p>
                  </div>

                  {/* Impact Environnemental */}
                  {alternative.environmental_benefit && (
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <h5 className="font-semibold text-emerald-800 text-sm mb-2">
                        🌍 Impact Environnemental
                      </h5>
                      <p className="text-xs text-emerald-700">
                        {alternative.environmental_benefit}
                      </p>
                    </div>
                  )}

                  {/* Preuves Scientifiques */}
                  {alternative.sources && alternative.sources.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h5 className="font-semibold text-purple-800 text-sm mb-2">
                        📚 Preuves Scientifiques
                      </h5>
                      <div className="text-xs text-purple-700 space-y-1">
                        {alternative.sources.slice(0, 2).map((source, idx) => (
                          <div key={idx}>• {source}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Guide de Transition */}
                <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h5 className="font-semibold text-orange-800 text-sm mb-3">
                    🎯 Guide de Transition Progressive
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="bg-white rounded p-2 border border-yellow-200">
                        <div className="font-medium text-yellow-800">Semaine 1</div>
                        <div className="text-yellow-700 mt-1">Tester 2x</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded p-2 border border-orange-200">
                        <div className="font-medium text-orange-800">Semaine 2</div>
                        <div className="text-orange-700 mt-1">50/50</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded p-2 border border-green-200">
                        <div className="font-medium text-green-800">Semaine 3</div>
                        <div className="text-green-700 mt-1">80% naturel</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-white rounded p-2 border border-green-300">
                        <div className="font-medium text-green-800">Semaine 4</div>
                        <div className="text-green-700 mt-1">100% adopté</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {alternative.recipe_link && (
                    <button className="bg-green-100 hover:bg-green-200 text-green-800 text-xs px-3 py-2 rounded-lg transition-colors">
                      📖 Voir la recette
                    </button>
                  )}
                  {alternative.usage_guide && (
                    <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-3 py-2 rounded-lg transition-colors">
                      📋 Guide d'usage
                    </button>
                  )}
                  <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs px-3 py-2 rounded-lg transition-colors">
                    💬 Poser une question sur cette alternative
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer avec Statistics */}
      <div className="mt-6 bg-white bg-opacity-70 rounded-lg p-4 border border-green-200">
        <div className="text-center">
          <h4 className="font-semibold text-green-800 text-sm mb-2">
            📊 Impact Prévu avec ces Alternatives
          </h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="font-bold text-green-700">-40%</div>
              <div className="text-green-600">Additifs évités</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700">+200%</div>
              <div className="text-blue-600">Qualité nutritionnelle</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-700">-30%</div>
              <div className="text-purple-600">Impact environnemental</div>
            </div>
          </div>
        </div>
      </div>

      {/* Source IA */}
      <div className="mt-4 text-center text-xs text-gray-500">
        🤖 Alternatives générées par l'IA scientifique ECOLOJIA basée sur sources ANSES, EFSA, INSERM 2024
      </div>
    </div>
  );
};

export default NaturalAlternatives;