// 🔵 FRONTEND - frontend/src/auth/components/AuthPage.tsx

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register' | 'success';

interface AuthPageProps {
  defaultMode?: AuthMode;
  redirectTo?: string;
  className?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  defaultMode = 'login',
  redirectTo = '/',
  className = ''
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [registrationEmail, setRegistrationEmail] = useState('');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si déjà connecté, rediriger
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLoginSuccess = () => {
    navigate(redirectTo);
  };

  const handleRegisterSuccess = () => {
    setMode('success');
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  // ✅ NOUVELLE FONCTION MODE DÉMO
  const handleDemoMode = () => {
    // Créer utilisateur démo factice dans localStorage
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@ecolojia.com',
      name: 'Utilisateur Démo',
      tier: 'premium', // Premium pour tester toutes les fonctionnalités
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quotas: {
        scansPerMonth: -1, // Illimité pour la démo
        aiQuestionsPerDay: -1, // Illimité pour la démo
        exportsPerMonth: -1,
        apiCallsPerMonth: -1
      },
      currentUsage: {
        scansThisMonth: 15,
        aiQuestionsToday: 3,
        exportsThisMonth: 2,
        apiCallsThisMonth: 45
      },
      subscription: {
        id: 'demo-sub-123',
        status: 'active' as const,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        cancelAtPeriodEnd: false
      }
    };

    // Stocker dans localStorage
    try {
      localStorage.setItem('ecolojia_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('ecolojia_demo_token', 'demo-token-12345');
      localStorage.setItem('ecolojia_demo_mode', 'true');
      
      // Simuler quelques données d'historique pour la démo
      const demoHistory = [
        {
          id: 'scan-1',
          productName: 'Coca-Cola Classic',
          category: 'food',
          healthScore: 25,
          scannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // -2 jours
          barcode: '5449000000996'
        },
        {
          id: 'scan-2',
          productName: 'L\'Oréal Paris Elvive Shampoing',
          category: 'cosmetics',
          healthScore: 65,
          scannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // -1 jour
          barcode: '3600523307234'
        },
        {
          id: 'scan-3',
          productName: 'Ariel Pods Original',
          category: 'detergents',
          healthScore: 45,
          scannedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // -3 heures
          barcode: '8001841007076'
        }
      ];
      
      localStorage.setItem('ecolojia_demo_history', JSON.stringify(demoHistory));
      
      console.log('✅ Mode démo activé - Données factices créées');
      
      // Rediriger vers le dashboard
      navigate('/dashboard');
      
      // Optionnel : Reload la page pour que le contexte Auth détecte le changement
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erreur activation mode démo:', error);
      alert('Erreur lors de l\'activation du mode démo');
    }
  };

  if (mode === 'success') {
    return (
      <div className={`auth-success ${className}`}>
        <SuccessMessage 
          email={registrationEmail}
          onBackToLogin={() => setMode('login')}
        />
      </div>
    );
  }

  return (
    <div className={`auth-page min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ECOLOJIA
          </h1>
          <p className="text-lg text-gray-600">
            Votre assistant IA pour une consommation éclairée
          </p>
        </div>

        {/* ✅ NOUVEAU BOUTON MODE DÉMO - Position proéminente */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-center max-w-md">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Tester en Mode Démo
            </h3>
            <p className="text-purple-100 text-sm mb-4">
              Explorez toutes les fonctionnalités sans inscription
            </p>
            <button
              onClick={handleDemoMode}
              className="w-full py-3 px-6 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              🎯 Lancer la Démo Complète
            </button>
            <p className="text-purple-200 text-xs mt-2">
              • Toutes fonctionnalités Premium • Données factices • Aucune inscription
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center justify-center mb-8">
          <div className="border-t border-gray-300 flex-1"></div>
          <div className="px-4 text-gray-500 text-sm">ou</div>
          <div className="border-t border-gray-300 flex-1"></div>
        </div>

        {/* Auth Forms */}
        <div className="flex justify-center">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Pourquoi choisir ECOLOJIA ?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                IA Scientifique
              </h3>
              <p className="text-gray-600">
                Analyses basées sur INSERM, ANSES et EFSA. 
                Classification NOVA, détection ultra-transformation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Expert IA Gratuit
              </h3>
              <p className="text-gray-600">
                5 questions par jour à notre nutritionniste IA. 
                Conseils personnalisés et alternatives saines.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Multi-Catégories
              </h3>
              <p className="text-gray-600">
                Alimentaire, cosmétiques, détergents. 
                Une seule app pour tous vos produits.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Features Preview */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            🎬 Aperçu Mode Démo
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📱</span>
                Interface Complète
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>Scanner multi-catégories fonctionnel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>Dashboard analytics avec vraies données</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>Chat IA conversationnel simulé</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                  <span>Historique avec analyses factices</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Fonctionnalités Premium
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">⭐</span>
                  <span>Accès illimité toutes fonctions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">⭐</span>
                  <span>Interface coaching IA avancé</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">⭐</span>
                  <span>Analytics détaillés simulés</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">⭐</span>
                  <span>Export données factices</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm flex items-start">
              <span className="text-blue-500 mr-2 mt-0.5">💡</span>
              <span>
                <strong>Mode Démo :</strong> Toutes les données sont factices et stockées localement. 
                Aucune information n'est envoyée sur internet. Parfait pour explorer l'interface !
              </span>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-semibold text-center text-gray-800 mb-6">
              🛡️ Vos données sont protégées
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm text-gray-600">RGPD</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🇫🇷</div>
                <div className="text-sm text-gray-600">Français</div>
              </div>
              <div>
                <div className="text-2xl mb-2">🔐</div>
                <div className="text-sm text-gray-600">Chiffré</div>
              </div>
              <div>
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm text-gray-600">Certifié</div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Aucune donnée personnelle partagée avec des tiers
            </p>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              🌱 Prêt à commencer votre parcours santé ?
            </h3>
            <p className="text-green-100 mb-6">
              Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leur consommation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleDemoMode}
                className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                🎯 Essayer la Démo
              </button>
              <button
                onClick={() => setMode('register')}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg border-2 border-green-600 hover:bg-green-700 hover:border-green-700 transition-all duration-200"
              >
                📝 Créer un Compte Gratuit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Message Component (inchangé)
interface SuccessMessageProps {
  email: string;
  onBackToLogin: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ email, onBackToLogin }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="text-6xl mb-6">🎉</div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Compte créé avec succès !
      </h2>
      
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          <strong>📧 Vérifiez votre email</strong>
        </p>
        <p className="text-green-700 text-sm mt-2">
          Nous avons envoyé un lien de vérification à <strong>{email}</strong>
        </p>
      </div>
      
      <div className="space-y-4 text-sm text-gray-600">
        <p>
          <strong>Étapes suivantes :</strong>
        </p>
        <div className="text-left space-y-2">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">1.</span>
            <span>Ouvrez votre boîte email</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">2.</span>
            <span>Cliquez sur le lien de vérification</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">3.</span>
            <span>Connectez-vous et commencez à scanner !</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button
          onClick={onBackToLogin}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
        >
          🚀 Aller à la connexion
        </button>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Conseil :</strong> Vérifiez aussi vos spams si vous ne voyez pas l'email
        </p>
      </div>
    </div>
  </div>
);