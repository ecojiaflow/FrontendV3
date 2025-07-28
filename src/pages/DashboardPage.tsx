// frontend/ecolojiaFrontV3/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import dashboardService from '../services/dashboard.service';
import LoadingSpinner from '../components/LoadingSpinner';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 mb-4">Erreur : {error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  // Configuration des graphiques
  const categoryData = {
    labels: ['Alimentaire', 'Cosmétiques', 'Détergents'],
    datasets: [{
      data: [
        stats.categoryBreakdown?.food || 0,
        stats.categoryBreakdown?.cosmetics || 0,
        stats.categoryBreakdown?.detergents || 0
      ],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      borderWidth: 0
    }]
  };

  const weeklyData = {
    labels: stats.weeklyTrend?.map(item => item.day) || [],
    datasets: [{
      label: 'Scans',
      data: stats.weeklyTrend?.map(item => item.scans) || [],
      fill: true,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: '#22C55E',
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Suivez votre progression santé</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total des scans</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.totalScans || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Score moyen</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.healthScoreAverage || 0}/100
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Cette semaine</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.weeklyTrend?.reduce((sum, day) => sum + day.scans, 0) || 0}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par catégorie</h3>
            <div className="h-64">
              <Doughnut data={categoryData} options={{ maintainAspectRatio: false }} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité hebdomadaire</h3>
            <div className="h-64">
              <Line data={weeklyData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>

        {/* Recent Analyses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Analyses récentes</h3>
          <div className="space-y-4">
            {stats.recentAnalyses && stats.recentAnalyses.length > 0 ? (
              stats.recentAnalyses.map((analysis) => (
                <div key={analysis._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{analysis.productName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${analysis.category === 'food' ? 'bg-green-100 text-green-800' : 
                        analysis.category === 'cosmetics' ? 'bg-blue-100 text-blue-800' : 
                        'bg-amber-100 text-amber-800'}`}>
                      {analysis.category === 'food' ? 'Alimentaire' :
                       analysis.category === 'cosmetics' ? 'Cosmétique' : 'Détergent'}
                    </span>
                    <span className={`text-2xl font-bold
                      ${analysis.score >= 80 ? 'text-green-600' :
                        analysis.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {analysis.score}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune analyse récente</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;