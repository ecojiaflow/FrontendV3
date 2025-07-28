// frontend/src/services/dashboardService.ts
import { apiClient } from './apiClient';

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

class DashboardService {
  async getStats(period: number = 30, category?: string): Promise<DashboardStats> {
    try {
      const params: any = { period };
      if (category && category !== 'all') {
        params.category = category;
      }

      const response = await apiClient.get('/dashboard/stats', { params });
      return response.data.stats;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des statistiques');
    }
  }

  async getAchievements() {
    try {
      const response = await apiClient.get('/dashboard/achievements');
      return response.data.achievements || [];
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des succès');
    }
  }

  async getRecommendations() {
    try {
      const response = await apiClient.get('/dashboard/recommendations');
      return response.data.recommendations || [];
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des recommandations');
    }
  }

  async getCommunityComparison() {
    try {
      const response = await apiClient.get('/dashboard/comparison');
      return response.data.comparison;
    } catch (error: any) {
      console.error('Error fetching community comparison:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement de la comparaison');
    }
  }

  async getWeeklySummary(weekStart?: string) {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await apiClient.get('/dashboard/weekly-summary', { params });
      return response.data.summary;
    } catch (error: any) {
      console.error('Error fetching weekly summary:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement du résumé hebdomadaire');
    }
  }

  async exportWeeklySummaryPDF(weekStart: string) {
    try {
      const response = await apiClient.post('/export/weekly-summary-pdf', 
        { weekStart }, 
        { responseType: 'blob' }
      );

      // Créer un lien de téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecolojia-weekly-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'export PDF');
    }
  }

  async emailWeeklySummary(weekStart: string) {
    try {
      const response = await apiClient.post('/dashboard/email-weekly-summary', { weekStart });
      return response.data;
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    }
  }
}

export const dashboardService = new DashboardService();