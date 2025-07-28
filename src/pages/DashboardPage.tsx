// frontend/src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import DailyAnalysesChart from '../components/dashboard/DailyAnalysesChart';
import RecommendationsSection from '../components/dashboard/RecommendationsSection';
import CommunityComparison from '../components/dashboard/CommunityComparison';
import WeeklySummary from '../components/dashboard/WeeklySummary';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Package,
  Heart,
  Leaf,
  AlertTriangle,
  Star,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalAnalyses: number;
    avgHealthScore: number;
    minHealthScore: number;
    maxHealthScore: number;
    categories: {
      food: number;
      cosmetics: number;
      detergents: number;
    };
  };
  trends: {
    healthScoreImprovement: number;
    comparedToLastMonth: number;
    currentStreak: number;
    bestStreak: number;
  };
  recommendations: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    icon: string;
    cta: string;
  }>;
  recentAnalyses: Array<{
    id: string;
    productName: string;
    category: string;
    healthScore: number;
    date: string;
    trend: 'up' | 'down' | 'stable';
    alternatives: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
  }>;
  community: {
    averageScore: number;
    userRank: number;
    totalUsers: number;
    topCategory: string;
  };
  weeklyDigest: {
    scansCount: number;
    avgScore: number;
    bestProduct: {
      name: string;
      score: number;
    };
    worstProduct: {
      name: string;
      score: number;
    };
    discoveries: number;
    alternatives: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dashboardService.getStats(timeRange);
      setStats(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Impossible de charger les données du dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      if (user?.tier !== 'premium' && format === 'pdf') {
        alert('L\'export PDF est réservé aux membres Premium');
        return;
      }

      const blob = await dashboardService.exportDashboardData(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecolojia-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      alert('Erreur lors de l\'export des données');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chargement de votre dashboard...</h3>
          <p className="text-gray-600">Calcul de vos métriques santé en cours</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error || 'Impossible de charger les données'}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bonjour {user?.name} ! 👋
              </h1>
              <p className="text-gray-600">
                Voici votre tableau de bord santé personnalisé
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exporter en CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exporter en PDF {user?.tier !== 'premium' && '⭐'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Score moyen</h3>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.overview.avgHealthScore}</p>
            <p className="text-sm text-gray-500 mt-1">sur 100</p>
            <div className="mt-4 flex items-center text-sm">
              {stats.trends.healthScoreImprovement > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
              )}
              <span className={stats.trends.healthScoreImprovement > 0 ? 'text-green-600' : 'text-red-600'}>
                {stats.trends.healthScoreImprovement > 0 ? '+' : ''}{stats.trends.healthScoreImprovement}%
              </span>
              <span className="text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Analyses totales</h3>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.overview.totalAnalyses}</p>
            <p className="text-sm text-gray-500 mt-1">ce mois</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600">
                <span>🍎 {Math.round(stats.overview.categories.food)}</span>
                <span>🧴 {Math.round(stats.overview.categories.cosmetics)}</span>
                <span>🧽 {Math.round(stats.overview.categories.detergents)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Série actuelle</h3>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.trends.currentStreak}</p>
            <p className="text-sm text-gray-500 mt-1">jours consécutifs</p>
            <div className="mt-4">
              <p className="text-xs text-gray-600">
                Record : {stats.trends.bestStreak} jours
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Rang communauté</h3>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">#{stats.community.userRank}</p>
            <p className="text-sm text-gray-500 mt-1">sur {stats.community.totalUsers}</p>
            <div className="mt-4">
              <p className="text-xs text-gray-600">
                Top {Math.round((stats.community.userRank / stats.community.totalUsers) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Analyses Chart */}
            <DailyAnalysesChart />

            {/* Recommendations */}
            <RecommendationsSection recommendations={stats.recommendations} />

            {/* Recent Analyses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Analyses récentes</h2>
              <div className="space-y-4">
                {stats.recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                        {analysis.healthScore}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{analysis.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {analysis.category === 'food' && '🍎 Alimentaire'}
                          {analysis.category === 'cosmetics' && '🧴 Cosmétique'}
                          {analysis.category === 'detergents' && '🧽 Détergent'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.date).toLocaleDateString('fr-FR')}
                      </p>
                      {analysis.alternatives > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {analysis.alternatives} alternatives
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-8">
            {/* Community Comparison */}
            <CommunityComparison stats={stats.community} />

            {/* Weekly Summary */}
            <WeeklySummary digest={stats.weeklyDigest} />

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Succès</h2>
              <div className="space-y-4">
                {stats.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-green-500 h-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.progress}/{achievement.maxProgress}
                          </p>
                        </div>
                      )}
                      {achievement.unlockedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;