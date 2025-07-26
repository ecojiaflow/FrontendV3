// PATH: frontend/ecolojiaFrontV3/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { paymentService } from '../services/paymentService';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  Zap,
  Heart,
  Leaf,
  AlertTriangle,
  Star,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useUserAnalytics } from '../hooks/useUserAnalytics';
import { UserGoal } from '../services/analytics/UserAnalytics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    metrics,
    evolution,
    insights,
    goals,
    achievements,
    weeklyReport,
    overallStats,
    topProducts,
    worstProducts,
    loading,
    error,
    refreshData,
    markInsightAsRead,
    addGoal,
    generateWeeklyReport,
    getScansThisWeek,
    getImprovementLastWeek,
    hasUnreadInsights,
    getStreakDays,
    exportData,
    resetData
  } = useUserAnalytics();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  useEffect(() => {
    // Récupérer le tier de l'utilisateur avec le bon endpoint
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('https://ecolojia-backend-working.onrender.com/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUserTier(response.data?.user?.tier || 'free');
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    fetchUserData();
  }, []);

  const [newGoal, setNewGoal] = useState({
    type: 'improve_score' as UserGoal['type'],
    title: '',
    description: '',
    target: 75,
    unit: 'points',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  const scansThisWeek = getScansThisWeek();
  const improvementLastWeek = getImprovementLastWeek();
  const streakDays = getStreakDays();
  const unreadInsights = hasUnreadInsights();

  const handleBackToHome = () => navigate('/');

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    addGoal({
      type: newGoal.type,
      title: newGoal.title,
      description: newGoal.description,
      target: newGoal.target,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      isCompleted: false
    });

    setShowAddGoal(false);
    setNewGoal({
      type: 'improve_score',
      title: '',
      description: '',
      target: 75,
      unit: 'points',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    
    try {
      if (userTier === 'premium') {
        // Pour les utilisateurs premium, essayer d'accéder au portail
        try {
          const portalUrl = await paymentService.getCustomerPortal();
          window.location.href = portalUrl;
        } catch (portalError: any) {
          console.error('Erreur portail:', portalError);
          
          // Si le portail n'est pas accessible, afficher un message
          if (portalError.message?.includes('404') || portalError.message?.includes('not found')) {
            alert("Le portail de gestion n'est pas encore disponible. Pour toute question sur votre abonnement, contactez-nous à support@ecolojia.com");
          } else {
            alert("Impossible d'accéder au portail client. Veuillez réessayer plus tard.");
          }
        }
      } else {
        // Pour les utilisateurs gratuits, créer un checkout
        try {
          const checkoutUrl = await paymentService.createCheckout();
          window.location.href = checkoutUrl;
        } catch (checkoutError: any) {
          console.error('Erreur checkout:', checkoutError);
          alert("Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.");
        }
      }
    } catch (error) {
      console.error('Erreur gestion abonnement:', error);
      alert("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsManagingSubscription(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'text-purple-600 bg-purple-100';
      case 'epic': return 'text-blue-600 bg-blue-100';
      case 'rare': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chargement de votre dashboard...</h3>
          <p className="text-gray-600">Calcul de vos métriques santé</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard ECOLOJIA</h1>
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const data = exportData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ecolojia-data-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Exporter mes données"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 🟡 Statut Premium */}
        <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl p-4 mb-6 border border-yellow-200 flex items-center justify-between">
          <div className="text-sm text-gray-800">
            {userTier === 'premium' ? (
              <span className="text-green-600 font-semibold">⭐ Vous êtes Premium</span>
            ) : (
              <span className="text-yellow-600 font-semibold">Gratuit</span>
            )}
            {userTier === 'premium'
              ? ' – merci pour votre soutien 💚'
              : ' – certaines fonctionnalités sont limitées.'}
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={isManagingSubscription}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isManagingSubscription ? (
              <span className="flex items-center">
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                Chargement...
              </span>
            ) : (
              userTier === 'premium' ? 'Gérer mon abonnement' : 'Passer Premium'
            )}
          </button>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Score moyen</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(metrics?.averageScore || 0)}`}>
              {metrics?.averageScore || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">sur 100</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Analyses ce mois</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {metrics?.totalAnalyses || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">produits analysés</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Série en cours</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {streakDays}
            </div>
            <p className="text-sm text-gray-500 mt-1">jours consécutifs</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Progression</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className={`text-3xl font-bold ${improvementLastWeek >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvementLastWeek >= 0 ? '+' : ''}{improvementLastWeek}%
            </div>
            <p className="text-sm text-gray-500 mt-1">cette semaine</p>
          </div>
        </div>

        {/* Insights et recommandations */}
        {insights && insights.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                💡 Insights et Recommandations
                {unreadInsights && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    Nouveau
                  </span>
                )}
              </h2>
            </div>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${
                    insight.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                      {insight.actionUrl && (
                        <button
                          onClick={() => navigate(insight.actionUrl!)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {insight.actionText || 'En savoir plus'} →
                        </button>
                      )}
                    </div>
                    {!insight.isRead && (
                      <button
                        onClick={() => markInsightAsRead(insight.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objectifs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">🎯 Mes Objectifs</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium">
                          {goal.current} / {goal.target} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {goal.isCompleted && (
                    <div className="ml-4 text-green-600">
                      <Award className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aucun objectif défini. Commencez par en ajouter un !
            </p>
          )}
        </div>

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 Succès Débloqués</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.filter(a => a.unlockedAt).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{achievement.icon}</span>
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm opacity-75">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-xs mt-2">
                    Débloqué le {new Date(achievement.unlockedAt!).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Ajout Objectif */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Nouvel Objectif</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'objectif
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as UserGoal['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="improve_score">Améliorer mon score moyen</option>
                    <option value="scan_count">Nombre d'analyses</option>
                    <option value="reduce_additives">Réduire les additifs</option>
                    <option value="increase_bio">Augmenter le bio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ex: Atteindre 80 de score moyen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Description de votre objectif..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cible
                  </label>
                  <input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddGoal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddGoal}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;