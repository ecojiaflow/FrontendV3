// frontend/src/services/dashboardService.ts
import { apiClient } from './apiClient';

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

class DashboardService {
  async getStats(range: 'week' | 'month' | 'year' = 'month'): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats', {
        params: { range }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      
      // Si erreur, retourner des données de démonstration
      console.log('Using demo data due to error');
      return this.getDemoStats();
    }
  }

  private getDemoStats(): DashboardStats {
    return {
      overview: {
        totalAnalyses: 12,
        avgHealthScore: 75,
        minHealthScore: 45,
        maxHealthScore: 92,
        categories: {
          food: 8,
          cosmetics: 3,
          detergents: 1
        }
      },
      trends: {
        healthScoreImprovement: 12,
        comparedToLastMonth: 15,
        currentStreak: 5,
        bestStreak: 12
      },
      recommendations: [
        {
          id: '1',
          type: 'welcome',
          title: 'Bienvenue sur ECOLOJIA !',
          description: 'Commencez par scanner votre premier produit',
          impact: 'high',
          icon: '🎉',
          cta: 'Scanner un produit'
        },
        {
          id: '2',
          type: 'health',
          title: 'Améliorez votre alimentation',
          description: 'Votre score moyen peut être amélioré avec des choix plus sains',
          impact: 'medium',
          icon: '🍎',
          cta: 'Voir les conseils'
        }
      ],
      recentAnalyses: [
        {
          id: '1',
          productName: 'Yaourt nature bio',
          category: 'food',
          healthScore: 92,
          date: new Date().toISOString(),
          trend: 'up',
          alternatives: 3
        }
      ],
      achievements: [
        {
          id: '1',
          title: 'Première semaine',
          description: 'Utilisez ECOLOJIA pendant 7 jours',
          icon: '🏆',
          progress: 5,
          maxProgress: 7
        }
      ],
      community: {
        averageScore: 72,
        userRank: 1250,
        totalUsers: 5000,
        topCategory: 'Alimentaire'
      },
      weeklyDigest: {
        scansCount: 12,
        avgScore: 78,
        bestProduct: {
          name: 'Pommes bio',
          score: 95
        },
        worstProduct: {
          name: 'Chips saveur barbecue',
          score: 35
        },
        discoveries: 5,
        alternatives: 8
      }
    };
  }

  async exportDashboardData(format: 'pdf' | 'csv'): Promise<Blob> {
    try {
      const response = await apiClient.get('/dashboard/export', {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      // Créer un export basique si l'endpoint n'existe pas
      const stats = await this.getStats();
      
      if (format === 'csv') {
        const csv = this.generateCSV(stats);
        return new Blob([csv], { type: 'text/csv' });
      } else {
        const text = this.generateTextReport(stats);
        return new Blob([text], { type: 'text/plain' });
      }
    }
  }

  private generateCSV(stats: DashboardStats): string {
    const lines = [
      'Métrique,Valeur',
      `Total analyses,${stats.overview.totalAnalyses}`,
      `Score moyen,${stats.overview.avgHealthScore}`,
      `Score minimum,${stats.overview.minHealthScore}`,
      `Score maximum,${stats.overview.maxHealthScore}`,
      `Analyses alimentaires,${stats.overview.categories.food}`,
      `Analyses cosmétiques,${stats.overview.categories.cosmetics}`,
      `Analyses détergents,${stats.overview.categories.detergents}`
    ];
    
    return lines.join('\n');
  }

  private generateTextReport(stats: DashboardStats): string {
    return `
RAPPORT ECOLOJIA
================

Vue d'ensemble
--------------
Total analyses: ${stats.overview.totalAnalyses}
Score moyen: ${stats.overview.avgHealthScore}/100
Score minimum: ${stats.overview.minHealthScore}/100
Score maximum: ${stats.overview.maxHealthScore}/100

Répartition par catégorie
-------------------------
Alimentaire: ${stats.overview.categories.food}
Cosmétiques: ${stats.overview.categories.cosmetics}
Détergents: ${stats.overview.categories.detergents}

Généré le: ${new Date().toLocaleDateString('fr-FR')}
    `;
  }
}

export const dashboardService = new DashboardService();