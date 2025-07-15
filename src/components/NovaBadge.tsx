// PATH: frontend/src/components/NovaBadge.tsx
import React from 'react';

interface NovaBadgeProps {
  level: number; // niveau 1 à 4
}

const getNovaColor = (level: number) => {
  switch (level) {
    case 1:
      return {
        bg: 'bg-green-100',
        border: 'border-green-200',
        text: 'text-green-600',
      };
    case 2:
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
      };
    case 3:
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-600',
      };
    case 4:
    default:
      return {
        bg: 'bg-red-100',
        border: 'border-red-200',
        text: 'text-red-600',
      };
  }
};

const NovaBadge: React.FC<NovaBadgeProps> = ({ level }) => {
  const { bg, border, text } = getNovaColor(level);

  return (
    <div className={`${bg} ${border} ${text} rounded-xl p-3 text-center border`}>
      <div className="text-lg font-bold">{level}</div>
      <div className="text-xs">NOVA</div>
    </div>
  );
};

export default NovaBadge;
// EOF
