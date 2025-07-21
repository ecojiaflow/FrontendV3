// frontend/src/services/demoService.ts

import { 
  MockUser, 
  MockQuotas, 
  MockAnalysisHistory,
  DEMO_CONFIG,
  createDemoSession
} from '../types/mockData';

export interface DemoSession {
  user: MockUser;
  quotas: MockQuotas;
  history: MockAnalysisHistory[];
  token: string;
  isDemo: true;
  expiresAt: Date;
}

class DemoService {
  private currentSession: DemoSession | null = null;

  /**
   * Initialise une session démo
   */
  startDemoSession(tier: 'free' | 'premium' = 'premium'): DemoSession {
    try {
      console.log(`[DEMO] Démarrage session ${tier}`);
      
      const session = createDemoSession(tier);
      this.currentSession = session;
      
      // Sauvegarde localStorage
      this.saveSessionToStorage(session);
      
      console.log(`[DEMO] Session ${tier} initialisée:`, session.user.name);
      return session;
    } catch (error) {
      console.error('[DEMO] Erreur démarrage session:', error);
      throw new Error('Impossible de démarrer le mode démo');
    }
  }

  /**
   * Récupère la session actuelle (localStorage ou mémoire)
   */
  getCurrentSession(): DemoSession | null {
    try {
      // Vérifier mémoire d'abord
      if (this.currentSession && this.isSessionValid(this.currentSession)) {
        return this.currentSession;
      }

      // Fallback localStorage
      const storedSession = this.loadSessionFromStorage();
      if (storedSession && this.isSessionValid(storedSession)) {
        this.currentSession = storedSession;
        return storedSession;
      }

      return null;
    } catch (error) {
      console.error('[DEMO] Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * Vérifie si session démo active
   */
  isDemoActive(): boolean {
    const session = this.getCurrentSession();
    return session !== null && session.isDemo === true;
  }

  /**
   * Termine la session démo
   */
  endDemoSession(): void {
    try {
      this.currentSession = null;
      
      // Nettoyer localStorage
      Object.values(DEMO_CONFIG).forEach(key => {
        if (typeof key === 'string') {
          localStorage.removeItem(key);
        }
      });
      
      console.log('[DEMO] Session terminée et données supprimées');
    } catch (error) {
      console.error('[DEMO] Erreur fin session:', error);
    }
  }

  /**
   * Simule une nouvelle analyse (quota++)
   */
  simulateNewAnalysis(category: 'food' | 'cosmetics' | 'detergents'): boolean {
    try {
      const session = this.getCurrentSession();
      if (!session) {
        console.warn('[DEMO] Pas de session active');
        return false;
      }

      // Vérifier quota scans
      if (!this.canPerformScan(session)) {
        console.warn('[DEMO] Quota scans dépassé');
        return false;
      }

      // Incrémenter usage
      session.quotas.scans.used += 1;
      session.user.stats.totalScans += 1;
      session.user.stats.analysesThisMonth += 1;
      session.user.currentUsage.scansThisMonth += 1;

      // Ajouter analyse fictive à l'historique
      const newAnalysis: MockAnalysisHistory = {
        id: `demo-analysis-${Date.now()}`,
        productName: this.generateRandomProductName(category),
        brand: this.generateRandomBrand(category),
        category,
        healthScore: Math.floor(Math.random() * 100),
        scanDate: new Date(),
        keyFindings: this.generateRandomFindings(category)
      };

      session.history.unshift(newAnalysis); // Ajouter en premier
      if (session.history.length > 50) {
        session.history.pop(); // Limiter historique
      }

      // Sauvegarder
      this.saveSessionToStorage(session);
      console.log('[DEMO] Nouvelle analyse simulée:', newAnalysis.productName);
      
      return true;
    } catch (error) {
      console.error('[DEMO] Erreur simulation analyse:', error);
      return false;
    }
  }

  /**
   * Simule usage IA Premium
   */
  simulateAIQuestion(): boolean {
    try {
      const session = this.getCurrentSession();
      if (!session || session.user.tier !== 'premium') {
        console.warn('[DEMO] IA réservée aux Premium');
        return false;
      }

      // Incrémenter usage IA
      session.quotas.aiQuestions.used += 1;
      session.user.currentUsage.aiQuestionsThisMonth += 1;
      session.user.currentUsage.aiQuestionsToday += 1;
      
      this.saveSessionToStorage(session);
      console.log('[DEMO] Question IA simulée');
      
      return true;
    } catch (error) {
      console.error('[DEMO] Erreur simulation IA:', error);
      return false;
    }
  }

  /**
   * Vérifie les quotas
   */
  canPerformScan(session?: DemoSession): boolean {
    const s = session || this.getCurrentSession();
    if (!s) return false;

    return s.quotas.scans.limit === -1 || s.quotas.scans.used < s.quotas.scans.limit;
  }

  canUseAI(session?: DemoSession): boolean {
    const s = session || this.getCurrentSession();
    if (!s || s.user.tier !== 'premium') return false;

    return s.quotas.aiQuestions.limit === -1 || s.quotas.aiQuestions.used < s.quotas.aiQuestions.limit;
  }

  canExportData(session?: DemoSession): boolean {
    const s = session || this.getCurrentSession();
    if (!s || s.user.tier !== 'premium') return false;

    return s.quotas.exports.limit === -1 || s.quotas.exports.used < s.quotas.exports.limit;
  }

  /**
   * Obtient les stats pour dashboard
   */
  getDashboardStats(): any {
    try {
      const session = this.getCurrentSession();
      if (!session) return null;

      const recentAnalyses = session.history.filter(
        a => Date.now() - a.scanDate.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 jours
      );

      return {
        totalScans: session.user.stats.totalScans,
        analysesThisMonth: session.user.stats.analysesThisMonth,
        averageHealthScore: session.user.stats.averageHealthScore,
        streak: session.user.stats.streak,
        recentAnalyses: recentAnalyses.length,
        categories: {
          food: session.history.filter(a => a.category === 'food').length,
          cosmetics: session.history.filter(a => a.category === 'cosmetics').length,
          detergents: session.history.filter(a => a.category === 'detergents').length
        },
        topProducts: session.history
          .sort((a, b) => b.healthScore - a.healthScore)
          .slice(0, 5),
        improvementTrend: this.calculateImprovementTrend(session.history)
      };
    } catch (error) {
      console.error('[DEMO] Erreur stats dashboard:', error);
      return null;
    }
  }

  /**
   * Simule changement tier (Free ↔ Premium)
   */
  switchTier(newTier: 'free' | 'premium'): DemoSession {
    this.endDemoSession();
    return this.startDemoSession(newTier);
  }

  // ==================== MÉTHODES PRIVÉES ====================

  private saveSessionToStorage(session: DemoSession): void {
    try {
      // Sauvegarder utilisateur
      localStorage.setItem(DEMO_CONFIG.STORAGE_KEY, JSON.stringify(session.user));
      
      // Sauvegarder token
      localStorage.setItem(DEMO_CONFIG.TOKEN_KEY, session.token);
      
      // Sauvegarder mode
      localStorage.setItem(DEMO_CONFIG.MODE_KEY, 'true');
      
      // Sauvegarder historique
      localStorage.setItem(DEMO_CONFIG.HISTORY_KEY, JSON.stringify(session.history));
      
    } catch (error) {
      console.error('[DEMO] Erreur sauvegarde localStorage:', error);
    }
  }

  private loadSessionFromStorage(): DemoSession | null {
    try {
      const storedUser = localStorage.getItem(DEMO_CONFIG.STORAGE_KEY);
      const storedToken = localStorage.getItem(DEMO_CONFIG.TOKEN_KEY);
      const storedMode = localStorage.getItem(DEMO_CONFIG.MODE_KEY);
      const storedHistory = localStorage.getItem(DEMO_CONFIG.HISTORY_KEY);
      
      if (!storedUser || !storedToken || storedMode !== 'true') {
        return null;
      }

      const user = JSON.parse(storedUser);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      // Reconstituer les dates (JSON les sérialise en strings)
      user.createdAt = new Date(user.createdAt);
      user.lastLoginAt = new Date(user.lastLoginAt);
      if (user.subscription) {
        user.subscription.currentPeriodEnd = new Date(user.subscription.currentPeriodEnd);
      }
      
      history.forEach((h: any) => {
        h.scanDate = new Date(h.scanDate);
      });

      // Créer les quotas à partir des données utilisateur
      const now = new Date();
      const quotas: MockQuotas = {
        scans: {
          used: user.currentUsage.scansThisMonth,
          limit: user.quotas.scansPerMonth,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        },
        aiQuestions: {
          used: user.currentUsage.aiQuestionsThisMonth,
          limit: user.quotas.aiQuestionsPerMonth,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        },
        exports: {
          used: user.currentUsage.exportsThisMonth,
          limit: user.quotas.exportsPerMonth,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        },
        apiCalls: {
          used: user.currentUsage.apiCallsThisMonth,
          limit: user.quotas.apiCallsPerMonth,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
        }
      };

      return {
        user,
        quotas,
        history,
        token: storedToken,
        isDemo: true,
        expiresAt: new Date(now.getTime() + DEMO_CONFIG.SESSION_DURATION_HOURS * 60 * 60 * 1000)
      };
    } catch (error) {
      console.error('[DEMO] Erreur lecture localStorage:', error);
      return null;
    }
  }

  private isSessionValid(session: DemoSession): boolean {
    return session.expiresAt > new Date();
  }

  private generateRandomProductName(category: string): string {
    const names = {
      food: ['Céréales Bio Avoine', 'Yaourt Nature', 'Pain Complet', 'Soupe Légumes', 'Chocolat Noir 70%'],
      cosmetics: ['Crème Hydratante', 'Shampooing Doux', 'Sérum Vitamine C', 'Baume Lèvres', 'Eau Micellaire'],
      detergents: ['Lessive Liquide', 'Liquide Vaisselle', 'Nettoyant Sol', 'Adoucissant Textile', 'Pastilles Lave-Vaisselle']
    };
    const categoryNames = names[category as keyof typeof names] || names.food;
    return categoryNames[Math.floor(Math.random() * categoryNames.length)];
  }

  private generateRandomBrand(category: string): string {
    const brands = {
      food: ['Bjorg', 'Carrefour Bio', 'Danone', 'Monoprix', 'Terra Etica'],
      cosmetics: ['Weleda', 'Cattier', 'Nuxe', 'Avène', 'Bioderma'],
      detergents: ['Ecover', 'L\'Arbre Vert', 'Rainett', 'Method', 'Frosch']
    };
    const categoryBrands = brands[category as keyof typeof brands] || brands.food;
    return categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
  }

  private generateRandomFindings(category: string): string[] {
    const findings = {
      food: [
        ['NOVA 1 - Non transformé', 'Riche en fibres', 'Sans additifs'],
        ['NOVA 3 - Transformé', 'Sucre ajouté modéré', '5 additifs'],
        ['NOVA 4 - Ultra-transformé', 'Riche en sel', '12 additifs E-numbers'],
        ['Bio certifié', 'Ingrédients naturels', 'Commerce équitable']
      ],
      cosmetics: [
        ['Certifié bio', 'Sans sulfates', 'Ingrédients naturels 95%'],
        ['1 allergène identifié', 'Testé dermatologiquement', 'Sans parabènes'],
        ['3 perturbateurs endocriniens', 'Formule synthétique', 'Allergènes parfums'],
        ['Cosmos Natural', 'Vegan friendly', 'Packaging recyclable']
      ],
      detergents: [
        ['Ecolabel Européen', 'Biodégradable 100%', 'Sans phosphates'],
        ['Impact aquatique modéré', 'Tensio-actifs végétaux', 'Parfum synthétique'],
        ['Toxique vie aquatique', 'Phosphates détectés', 'Non biodégradable'],
        ['Certifié Cradle to Cradle', 'Formule concentrée', 'Emballage consigné']
      ]
    };
    const categoryFindings = findings[category as keyof typeof findings] || findings.food;
    return categoryFindings[Math.floor(Math.random() * categoryFindings.length)];
  }

  private calculateImprovementTrend(history: MockAnalysisHistory[]): number {
    if (history.length < 2) return 0;

    const sorted = [...history].sort((a, b) => a.scanDate.getTime() - b.scanDate.getTime());
    const recent = sorted.slice(-5); // 5 derniers
    const older = sorted.slice(-10, -5); // 5 précédents

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, a) => sum + a.healthScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.healthScore, 0) / older.length;

    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }
}

// Instance singleton
export const demoService = new DemoService();