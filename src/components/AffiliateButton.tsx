// ✅ Nouveau composant réutilisable
import React from 'react';

interface AffiliateButtonProps {
  linkId: string;          // UUID du PartnerLink
  children?: React.ReactNode;
}

const AffiliateButton: React.FC<AffiliateButtonProps> = ({ linkId, children }) => {
  const handleClick = () => {
    // Redirection plein navigateur pour déclencher 302 côté backend
    window.location.href = `${import.meta.env.VITE_API_URL}/api/track/${linkId}`;
  };

  return (
    <button
      onClick={handleClick}
      className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-white shadow-md hover:bg-green-700 transition"
    >
      {children ?? 'Voir chez le partenaire'}
    </button>
  );
};

export default AffiliateButton;

