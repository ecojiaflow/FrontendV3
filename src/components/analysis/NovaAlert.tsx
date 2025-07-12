// 📁 src/components/analysis/NovaAlert.tsx

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  novaGroup?: number;
}

export const NovaAlert: React.FC<Props> = ({ novaGroup }) => {
  if (!novaGroup) return null;

  const messages = [
    null,
    "Produit brut ou très peu transformé (NOVA 1)",
    "Produit modérément transformé (NOVA 2)",
    "Produit transformé (NOVA 3)",
    "🚨 Produit ultra-transformé (NOVA 4)"
  ];

  const colors = [
    '',
    'bg-green-50 border-green-300 text-green-800',
    'bg-yellow-50 border-yellow-300 text-yellow-800',
    'bg-orange-50 border-orange-300 text-orange-800',
    'bg-red-50 border-red-300 text-red-800'
  ];

  const icons = [
    null,
    <CheckCircle className="w-5 h-5 text-green-600" />,
    <CheckCircle className="w-5 h-5 text-yellow-500" />,
    <AlertTriangle className="w-5 h-5 text-orange-500" />,
    <AlertTriangle className="w-5 h-5 text-red-600" />
  ];

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-start gap-3 ${colors[novaGroup]}`}>
      {icons[novaGroup]}
      <div>
        <p className="font-medium">Niveau de transformation détecté :</p>
        <p className="text-sm">{messages[novaGroup]}</p>
      </div>
    </div>
  );
};
