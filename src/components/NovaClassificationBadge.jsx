// frontend/src/components/NovaClassificationBadge.jsx

import React from 'react';

const NovaClassificationBadge = ({ novaGroup, groupInfo, healthImpact }) => {
  const getNovaStyle = (group) => {
    switch(group) {
      case 4:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: '🚨',
          message: 'Ultra-transformé détecté'
        };
      case 3:
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-200',
          icon: '⚠️',
          message: 'Transformé'
        };
      case 2:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: '🥄',
          message: 'Ingrédient culinaire'
        };
      case 1:
      default:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: '🌱',
          message: 'Naturel ou minimalement transformé'
        };
    }
  };

  const style = getNovaStyle(novaGroup);

  return (
    <div className="flex flex-col items-center mt-6">
      {/* Badge Principal */}
      <div className={`${style.bg} ${style.text} ${style.border} border-2 rounded-full px-6 py-3 flex items-center space-x-3 shadow-sm`}>
        <span className="text-xl">{style.icon}</span>
        <div className="text-center">
          <div className="font-bold text-lg">Classification NOVA</div>
          <div className="text-sm">Groupe {novaGroup} - {style.message}</div>
        </div>
      </div>

      {/* Explication Détaillée */}
      <div className="mt-4 text-center max-w-md">
        <p className="text-sm text-gray-600 mb-2">
          {groupInfo?.description || "Classification selon INSERM 2024"}
        </p>
        
        {/* Alerte Ultra-transformation */}
        {novaGroup === 4 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <div className="text-xs text-red-700 font-medium mb-1">
              ⚡ Impact Santé Scientifiquement Prouvé
            </div>
            <div className="text-xs text-red-600">
              +22% risque dépression • +53% risque diabète • +10% maladies cardiovasculaires
            </div>
            <div className="text-xs text-red-500 mt-1">
              Sources : Nature 2024, BMJ 2024, Diabetes Care 2024
            </div>
          </div>
        )}

        {/* Message Positif pour Produits Naturels */}
        {novaGroup === 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="text-xs text-green-700 font-medium mb-1">
              ✨ Excellent Choix Santé
            </div>
            <div className="text-xs text-green-600">
              Préserve la matrice alimentaire • Haute densité nutritionnelle • Microbiote protégé
            </div>
          </div>
        )}
      </div>

      {/* Source Scientifique */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        Classification NOVA officielle - INSERM 2024
      </div>
    </div>
  );
};

export default NovaClassificationBadge;