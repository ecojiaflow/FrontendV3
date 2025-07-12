// 📁 src/components/analysis/ScientificScore.tsx

import React from 'react';
import { CircleGauge } from 'lucide-react';

interface Props {
  score: number;
  breakdown: {
    environmental: number;
    health: number;
    social: number;
    processing: number;
  };
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

export const ScientificScore: React.FC<Props> = ({ score, breakdown }) => {
  return (
    <div className="bg-white border rounded-xl shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CircleGauge className={`w-6 h-6 ${getScoreColor(score)}`} />
          <h2 className="text-lg font-semibold text-gray-800">
            Score scientifique global
          </h2>
        </div>
        <span className={`text-xl font-bold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          🌱 Environnemental : <strong>{breakdown.environmental}/100</strong>
        </div>
        <div>
          🧬 Santé : <strong>{breakdown.health}/100</strong>
        </div>
        <div>
          🤝 Social : <strong>{breakdown.social}/100</strong>
        </div>
        <div>
          🏭 Transformation : <strong>{breakdown.processing}/100</strong>
        </div>
      </div>
    </div>
  );
};
