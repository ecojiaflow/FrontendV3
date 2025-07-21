// PATH: frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // États pour modal goal
  const [newGoal, setNewGoal] = useState({
    type: 'improve_score' as UserGoal['type'],
    title: '',
    description: '',
    target: 75,
    unit: 'points',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  });

  // Données calculées
  const scansThisWeek = getScansThisWeek();
  const improvementLastWeek = getImprovementLastWeek();
  const streakDays = getStreakDays();
  const unreadInsights = hasUnreadInsights();

  const handleBackToHome = () => {
    navigate('/');
  };

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

  const getGoalTypeLabel = (type: UserGoal['type']): string => {
    switch (type) {
      case 'improve_score': return 'Améliorer le score';
      case 'reduce_ultra_processed': return 'Réduire ultra-transformés';
      case 'increase_bio': return 'Augmenter le bio';
      case 'reduce_additives': return 'Réduire les additifs';
      default: return 'Objectif personnalisé';
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

  // Première utilisation
  if (!metrics || overallStats?.totalScans === 0) {
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
                Retour à l'accueil
              </button>
              <h1 className="text-2xl font-bold text-gray-800">📊 Mon Dashboard ECOLOJIA</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </div>

        {/* Onboarding */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center bg-white rounded-xl p-12 shadow-sm">
            <div className="text-8xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Bienvenue dans votre Dashboard !
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Commencez par analyser quelques produits pour voir apparaître vos statistiques personnalisées, 
              insights IA et objectifs santé.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-gray-800 mb-2">Analysez</h3>
                <p className="text-sm text-gray-600">Scannez ou analysez vos premiers produits</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-gray-800 mb-2">Suivez</h3>
                <p className="text-sm text-gray-600">Observez l'évolution de votre score santé</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-800 mb-2">Améliorez</h3>
                <p className="text-sm text-gray-600">Atteignez vos objectifs nutrition</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/analyze')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                🔬 Analyser un produit
              </button>
              <button
                onClick={() => navigate('/search')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                🔍 Rechercher des produits
              </button>
              <button
                onClick={() => navigate('/scan')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                📱 Scanner un code-barres
              </button>
            </div>
          </div>
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
            
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              📊 Dashboard ECOLOJIA
              {unreadInsights && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Nouveau
                </span>
              )}
            </h1>
            
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
        {/* Row 1: Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Score Global */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Score Santé</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(metrics.healthScore)} mb-2`}>
                {metrics.healthScore}
              </div>
              <div className="text-sm text-gray-500">sur 100</div>
              {metrics.improvementTrend !== 0 && (
                <div className={`mt-2 text-sm font-medium ${metrics.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.improvementTrend > 0 ? '↗️' : '↘️'} {Math.abs(metrics.improvementTrend)} pts
                </div>
              )}
            </div>
          </div>

          {/* Scans cette semaine */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Cette semaine</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {scansThisWeek}
              </div>
              <div className="text-sm text-gray-500">analyses</div>
              {improvementLastWeek !== 0 && (
                <div className={`mt-2 text-sm font-medium ${improvementLastWeek > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvementLastWeek > 0 ? '📈' : '📉'} {Math.abs(improvementLastWeek)} pts
                </div>
              )}
            </div>
          </div>

          {/* Série */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Série active</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {streakDays}
              </div>
              <div className="text-sm text-gray-500">
                jour{streakDays > 1 ? 's' : ''}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                🔥 Continue comme ça !
              </div>
            </div>
          </div>

          {/* Ultra-transformés */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Ultra-transformés</h3>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${metrics.ultraTransformPercent > 50 ? 'text-red-600' : metrics.ultraTransformPercent > 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                {metrics.ultraTransformPercent}%
              </div>
              <div className="text-sm text-gray-500">de vos produits</div>
              <div className="mt-2 text-xs text-gray-400">
                {metrics.ultraTransformPercent <= 20 ? '✅ Excellent !' : 
                 metrics.ultraTransformPercent <= 50 ? '⚠️ À surveiller' : 
                 '🚨 Trop élevé'}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Graphique évolution + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution du score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Évolution de votre score</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod('7')}
                  className={`px-3 py-1 text-sm rounded-lg ${selectedPeriod === '7' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  7j
                </button>
                <button
                  onClick={() => setSelectedPeriod('30')}
                  className={`px-3 py-1 text-sm rounded-lg ${selectedPeriod === '30' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  30j
                </button>
              </div>
            </div>
            
            {evolution.length > 0 ? (
              <div className="space-y-3">
                {evolution.slice(-parseInt(selectedPeriod)).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {day.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${day.healthScore >= 80 ? 'bg-green-500' : day.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${day.healthScore}%` }}
                        ></div>
                      </div>
                      <div className={`text-sm font-medium w-8 ${getScoreColor(day.healthScore)}`}>
                        {day.healthScore}
                      </div>
                      <div className="text-xs text-gray-400 w-12">
                        {day.scansCount} scan{day.scansCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Analysez plus de produits pour voir l'évolution</p>
              </div>
            )}
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">💡 Insights IA</h3>
              {unreadInsights && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Nouveaux
                </span>
              )}
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {insights.length > 0 ? insights.map((insight) => (
                <div 
                  key={insight.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    insight.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => markInsightAsRead(insight.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.priority === 'high' ? 'Urgent' :
                       insight.priority === 'medium' ? 'Important' : 'Info'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                  <p className="text-xs text-green-600 font-medium">{insight.action}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🤖</div>
                  <p>Analysez plus de produits pour recevoir des conseils personnalisés</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Objectifs + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Objectifs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">🎯 Mes Objectifs</h3>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </button>
            </div>
            
            <div className="space-y-4">
              {goals.length > 0 ? goals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      goal.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {goal.isCompleted ? '✅ Terminé' : 'En cours'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium">{Math.round(goal.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${goal.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, goal.progress)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{goal.current} / {goal.target} {goal.unit}</span>
                    <span>Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-3">Aucun objectif défini</p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Créer votre premier objectif
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">🏆 Achievements</h3>
              <span className="text-sm text-gray-500">
                {achievements.length} débloqué{achievements.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-3">
              {achievements.length > 0 ? achievements.slice(0, 4).map((achievement) => (
                <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Analysez des produits pour débloquer des achievements !</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Produits top/flop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top produits */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Vos meilleurs choix
            </h3>
            
            <div className="space-y-3">
              {topProducts.length > 0 ? topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{product.productName}</h4>
                      <p className="text-xs text-gray-600">NOVA {product.novaGroup}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold text-sm">{product.healthScore}/100</span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">Analysez plus de produits pour voir votre top 5</p>
              )}
            </div>
          </div>

          {/* Produits à éviter */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              À remplacer en priorité
            </h3>
            
            <div className="space-y-3">
              {worstProducts.length > 0 ? worstProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">{product.productName}</h4>
                      <p className="text-xs text-gray-600">
                        NOVA {product.novaGroup} • {product.additives.length} additif{product.additives.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600 font-bold text-sm">{product.healthScore}/100</span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">Aucun produit problématique détecté - bravo !</p>
              )}
            </div>
          </div>
        </div>

        {/* Rapport hebdomadaire */}
        {weeklyReport && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-8">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-800">📊 Rapport de la semaine</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyReport.scansCount}</div>
                <div className="text-sm text-gray-600">Analyses effectuées</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${getScoreColor(weeklyReport.avgHealthScore)}`}>
                  {weeklyReport.avgHealthScore}
                </div>
                <div className="text-sm text-gray-600">Score moyen</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${weeklyReport.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyReport.improvement >= 0 ? '+' : ''}{weeklyReport.improvement}
                </div>
                <div className="text-sm text-gray-600">Évolution points</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">💡 Insight principal</h4>
              <p className="text-sm text-gray-700 mb-3">{weeklyReport.mainInsight}</p>
              <h4 className="font-medium text-gray-800 mb-2">🎯 Objectif semaine prochaine</h4>
              <p className="text-sm text-green-700 font-medium">{weeklyReport.nextWeekGoal}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal ajout objectif */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Nouvel objectif</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'objectif</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({...newGoal, type: e.target.value as UserGoal['type']})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="improve_score">Améliorer le score santé</option>
                  <option value="reduce_ultra_processed">Réduire les ultra-transformés</option>
                  <option value="increase_bio">Augmenter le bio</option>
                  <option value="reduce_additives">Réduire les additifs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="Ex: Atteindre 80 points de score santé"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif à atteindre</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  placeholder="Pourquoi cet objectif est important pour moi..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.title.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;