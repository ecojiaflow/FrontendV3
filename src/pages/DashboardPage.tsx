// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { DailyAnalysesChart } from '../components/dashboard/DailyAnalysesChart';
import { RecommendationsSection } from '../components/dashboard/RecommendationsSection';
import { CommunityComparison } from '../components/dashboard/CommunityComparison';
import { WeeklySummary } from '../components/dashboard/WeeklySummary';
import { Trophy, TrendingUp, Package, AlertCircle, ChevronRight, Zap, Lock, Star, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  overview: {
    totalAnalyses: number;
    avgHealthScore: number;
    minHealthScore: number;
    maxHealthScore: number;
    categoriesAnalyzed: number;
  };
  dailyAnalyses: Array<{
    date: string;
    count: number;
    avgScore: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    avgScore: number;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    brand: string;
    category: string;
    scanCount: number;
    avgScore: number;
  }>;
  scoresByCategory: {
    [key: string]: {
      avgScore: number;
      totalAnalyses: number;
    };
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Insight {
  id: string;
  type: 'tip' | 'warning' | 'success';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [chartViewType, setChartViewType] = useState<'line' | 'bar' | 'area' | 'composed'>('composed');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'food' | 'cosmetics' | 'detergents'>('all');
  const [showAdvancedSections, setShowAdvancedSections] = useState(false);

  const isPremium = user?.tier === 'premium';

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, categoryFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats with category filter
      const statsData = await dashboardService.getStats(selectedPeriod, categoryFilter);
      setStats(statsData);

      // Fetch achievements
      const achievementsData = await dashboardService.getAchievements();
      setAchievements(achievementsData);

      // Generate insights based on stats
      const generatedInsights = generateInsights(statsData);
      setInsights(generatedInsights);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Erreur lors du chargement du tableau de bord');
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: DashboardStats): Insight[] => {
    const insights: Insight[] = [];

    // Insight sur le score moyen
    if (data.overview.avgHealthScore < 50) {
      insights.push({
        id: 'low-score',
        type: 'warning',
        title: 'Score santé faible',
        description: 'Votre score moyen est en dessous de 50. Privilégiez des produits moins transformés.',
        action: {
          label: 'Voir les alternatives',
          onClick: () => navigate('/search')
        }
      });
    } else if (data.overview.avgHealthScore > 70) {
      insights.push({
        id: 'high-score',
        type: 'success',
        title: 'Excellent score santé !',
        description: 'Continuez sur cette lancée avec des produits sains.',
      });
    }

    // Insight sur la fréquence
    if (data.overview.totalAnalyses < 5) {
      insights.push({
        id: 'low-usage',
        type: 'tip',
        title: 'Utilisez Ecolojia plus souvent',
        description: 'Scannez régulièrement vos produits pour un suivi optimal de votre consommation.',
        action: {
          label: 'Scanner un produit',
          onClick: () => navigate('/scan')
        }
      });
    }

    // Insight Premium
    if (!isPremium) {
      insights.push({
        id: 'upgrade-premium',
        type: 'tip',
        title: 'Débloquez plus de fonctionnalités',
        description: 'Passez Premium pour des analyses illimitées et l\'IA conversationnelle.',
        action: {
          label: 'Découvrir Premium',
          onClick: () => navigate('/premium')
        }
      });
    }

    return insights;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍎';
      case 'cosmetics': return '🧴';
      case 'detergents': return '🧽';
      default: return '📦';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Filter data based on category
  const getFilteredData = () => {
    if (!stats || categoryFilter === 'all') return stats;

    return {
      ...stats,
      topProducts: stats.topProducts.filter(p => p.category === categoryFilter),
      categoryBreakdown: stats.categoryBreakdown.filter(c => c.category === categoryFilter),
      dailyAnalyses: stats.dailyAnalyses // Keep all daily analyses
    };
  };

  const filteredStats = getFilteredData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !filteredStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Erreur de chargement'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Bonjour {user?.name} ! Voici votre activité sur Ecolojia.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Période :</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={7}>7 derniers jours</option>
                <option value={30}>30 derniers jours</option>
                <option value={90}>3 derniers mois</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Toutes catégories</option>
                <option value="food">🍎 Alimentaire</option>
                <option value="cosmetics">🧴 Cosmétiques</option>
                <option value="detergents">🧽 Détergents</option>
              </select>
            </div>
          </div>

          {/* Chart View Type */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vue graphique :</span>
            <select
              value={chartViewType}
              onChange={(e) => setChartViewType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="composed">Combinée</option>
              <option value="line">Lignes</option>
              <option value="bar">Barres</option>
              <option value="area">Aires</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analyses totales</p>
                <p className="text-2xl font-bold text-gray-800">{filteredStats.overview.totalAnalyses}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Score moyen</p>
                <p className={`text-2xl font-bold ${getScoreColor(filteredStats.overview.avgHealthScore)}`}>
                  {filteredStats.overview.avgHealthScore}/100
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-2xl font-bold text-gray-800">{filteredStats.overview.categoriesAnalyzed}</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meilleur score</p>
                <p className="text-2xl font-bold text-green-600">{filteredStats.overview.maxHealthScore}/100</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Daily Analyses Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <DailyAnalysesChart
            data={filteredStats.dailyAnalyses}
            period={selectedPeriod}
            viewType={chartViewType}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Produits les plus scannés
            </h2>
            <div className="space-y-3">
              {filteredStats.topProducts.length > 0 ? (
                filteredStats.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(product.avgScore)} ${getScoreColor(product.avgScore)}`}>
                        {Math.round(product.avgScore)}/100
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{product.scanCount} scans</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun produit scanné dans cette catégorie</p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Répartition par catégorie</h2>
            <div className="space-y-4">
              {filteredStats.categoryBreakdown.length > 0 ? (
                filteredStats.categoryBreakdown.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                        <span className="font-medium text-gray-700 capitalize">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{category.count} analyses</span>
                        <p className={`text-sm font-medium ${getScoreColor(category.avgScore)}`}>
                          Moy: {Math.round(category.avgScore)}/100
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(category.count / filteredStats.overview.totalAnalyses) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune donnée pour cette catégorie</p>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Succès débloqués
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.unlocked ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Insights personnalisés
          </h2>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-l-4 transition-all ${
                  insight.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50'
                    : insight.type === 'success'
                    ? 'border-green-500 bg-green-50'
                    : 'border-blue-500 bg-blue-50'
                }`}
              >
                <h3 className="font-medium text-gray-800">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                {insight.action && (
                  <button
                    onClick={insight.action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                  >
                    {insight.action.label}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Sections Toggle Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAdvancedSections(!showAdvancedSections)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            {showAdvancedSections ? 'Masquer' : 'Afficher'} les analyses avancées
            <ChevronRight className={`w-5 h-5 ml-2 transform transition-transform ${showAdvancedSections ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Advanced Sections (Recommendations, Community Comparison, Weekly Summary) */}
        {showAdvancedSections && (
          <div className="space-y-8">
            {/* Recommendations */}
            <RecommendationsSection />
            
            {/* Community Comparison - Premium only */}
            {isPremium ? (
              <CommunityComparison />
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparaison Communauté</h3>
                <p className="text-gray-600 mb-4">
                  Comparez vos performances avec la communauté Ecolojia
                </p>
                <button
                  onClick={() => navigate('/premium')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Débloquer avec Premium
                </button>
              </div>
            )}
            
            {/* Weekly Summary */}
            <WeeklySummary />
          </div>
        )}

        {/* Premium Upsell for Free Users */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Débloquez plus avec Premium
                </h3>
                <p className="mt-2">
                  Analyses illimitées, IA conversationnelle, exports PDF et bien plus !
                </p>
              </div>
              <button
                onClick={() => navigate('/premium')}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Passer Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}