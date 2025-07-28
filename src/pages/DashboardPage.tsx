// PATH: frontend/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchDashboardStats,
  fetchDashboardTrends,
  fetchDashboardAchievements
} from '../services/dashboardService';
import { paymentService } from '../services/paymentService';
import {
  ArrowLeft, RefreshCw, Award, TrendingUp, BarChart3, Heart, Zap, Info, Flame
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, achievementsRes] = await Promise.all([
        fetchDashboardStats(),
        fetchDashboardTrends(),
        fetchDashboardAchievements()
      ]);
      setStats(statsRes);
      setTrends(trendsRes);
      setAchievements(achievementsRes);
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    getUserTier();
  }, []);

  const getUserTier = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('https://ecolojia-backend-working.onrender.com/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setUserTier(data.user?.tier || 'free');
    } catch (err) {
      console.warn('Impossible de récupérer le tier utilisateur.');
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleManageSubscription = async () => {
    setIsManagingSubscription(true);
    try {
      if (userTier === 'premium') {
        const portalUrl = await paymentService.getCustomerPortal();
        window.location.href = portalUrl;
      } else {
        const checkoutUrl = await paymentService.createCheckout();
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      alert("Erreur avec le service d'abonnement. Réessayez plus tard.");
    } finally {
      setIsManagingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats || !trends) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Accueil
        </button>
        <h1 className="text-xl font-bold text-gray-800">📊 Dashboard ECOLOJIA</h1>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="text-gray-600 hover:text-gray-800"
            title="Rafraîchir"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleManageSubscription}
            disabled={isManagingSubscription}
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
          >
            {userTier === 'premium' ? 'Gérer Premium' : 'Passer Premium'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* 🔢 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <p className="text-sm text-gray-500 mb-2">Total d'analyses</p>
            <p className="text-3xl font-bold text-green-600">{stats.overview.totalAnalyses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <p className="text-sm text-gray-500 mb-2">Score moyen</p>
            <p className={`text-3xl font-bold ${getScoreColor(stats.overview.avgHealthScore)}`}>
              {stats.overview.avgHealthScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <p className="text-sm text-gray-500 mb-2">Top produit</p>
            <p className="text-lg text-gray-800">{stats.topProducts?.[0]?.name || '—'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <p className="text-sm text-gray-500 mb-2">Catégorie top</p>
            <p className="text-lg text-gray-800">{stats.categoryBreakdown?.[0]?.category || '—'}</p>
          </div>
        </div>

        {/* 💡 Insights */}
        {trends.insights && trends.insights.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Insights personnalisés</h2>
            <div className="space-y-4">
              {trends.insights.map((insight: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-1">
                    <Info className="w-4 h-4 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">{insight.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🏆 Succès */}
        {achievements.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Succès débloqués</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((a, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-1">
                    <Award className="w-4 h-4 text-yellow-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">{a.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
// EOF
