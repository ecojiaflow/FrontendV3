// PATH: frontend/ecolojiaFrontV3/src/services/ai/DeepSeekECOLOJIAService.ts

export type UserTier = 'free' | 'premium';
export type AssistantType = 'nutritionist' | 'dermatologist' | 'eco_expert' | 'general';

export interface DeepSeekConfig {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature: number;
  maxTokens: number;
  costPer1MTokens: number;
  responseQuality: 'basic' | 'advanced';
}

export interface UserLimits {
  dailyQuestions: number;
  maxTokensPerQuestion: number;
  availableCategories: string[];
  aiModel: 'deepseek-chat' | 'deepseek-reasoner';
  detailedAnalysis: boolean;
  expertRecommendations: boolean;
  multiProductComparison: boolean;
}

export interface ProductContext {
  productName: string;
  category: 'alimentaire' | 'cosmetique' | 'detergent';
  
  // Données communes
  healthScore: number;
  barcode?: string;
  
  // Alimentaire
  novaGroup?: number;
  nutriScore?: string;
  additives?: Array<{
    code: string;
    name: string;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  
  // Cosmétique
  inciIngredients?: string[];
  skinType?: string[];
  naturalityScore?: number;
  
  // Détergent
  ecoScore?: number;
  biodegradability?: string;
  environmentalImpact?: string;
}

class DeepSeekECOLOJIAService {
  private readonly API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY;
  private readonly BASE_URL = 'https://api.deepseek.com/v1/chat/completions';
  
  // 💰 CONFIGURATION ÉCONOMIQUE DEEPSEEK
  private readonly DEEPSEEK_CONFIGS: Record<UserTier, DeepSeekConfig> = {
    free: {
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      costPer1MTokens: 0.27, // $0.27 pour 1M tokens
      responseQuality: 'basic'
    },
    premium: {
      model: 'deepseek-reasoner', 
      temperature: 0.8,
      maxTokens: 8000,
      costPer1MTokens: 0.55, // $0.55 pour 1M tokens (meilleure qualité)
      responseQuality: 'advanced'
    }
  };

  // 🎯 LIMITES FREEMIUM
  private readonly USER_LIMITS: Record<UserTier, UserLimits> = {
    free: {
      dailyQuestions: 5,
      maxTokensPerQuestion: 2000,
      availableCategories: ['alimentaire'], // Alimentaire uniquement
      aiModel: 'deepseek-chat',
      detailedAnalysis: false,
      expertRecommendations: false,
      multiProductComparison: false
    },
    premium: {
      dailyQuestions: -1, // Illimité
      maxTokensPerQuestion: 8000,
      availableCategories: ['alimentaire', 'cosmetique', 'detergent'],
      aiModel: 'deepseek-reasoner',
      detailedAnalysis: true,
      expertRecommendations: true,
      multiProductComparison: true
    }
  };

  // 🔬 PROMPTS SPÉCIALISÉS DEEPSEEK
  private readonly SPECIALIZED_PROMPTS = {
    nutritionist: {
      free: `Tu es un assistant nutritionnel ECOLOJIA utilisant la classification NOVA.

ANALYSE BASIQUE (Version Gratuite) :
- Classification NOVA 1-4 simple
- Détection additifs majeurs uniquement  
- Conseils généraux nutrition
- Réponses concises et claires

LIMITATION : Analyses alimentaires de base uniquement.
STYLE : Accessible, bienveillant, factuel.
LONGUEUR : Maximum 300 mots.`,

      premium: `Tu es Dr. Marie Dubois, diététicienne-nutritionniste experte ECOLOJIA avec accès complet.

ANALYSE AVANCÉE (Version Premium) :
- Classification NOVA détaillée avec justifications INSERM
- Analyse complète additifs E-numbers + risques EFSA
- Impact microbiote intestinal scientifique
- Recommandations personnalisées poussées
- Alternatives spécifiques avec comparatifs
- Conseils selon profils (diabète, allergies, etc.)

EXPERTISE DEEPSEEK :
- Utilise tes capacités de raisonnement avancé
- Analyses multi-facteurs complexes
- Corrélations scientifiques approfondies
- Recommandations sur-mesure

STYLE : Professionnel expert, références scientifiques, conseils détaillés.
LONGUEUR : Analyses complètes jusqu'à 1000 mots si nécessaire.`
    },

    dermatologist: {
      premium: `Tu es Dr. Sophie Laurent, dermatologue et chimiste cosmétique, experte INCI.

ANALYSE COSMÉTIQUE PREMIUM :
- Décodage INCI complet avec fonctions
- Détection perturbateurs endocriniens (ANSES/REACH)
- Identification 26 allergènes réglementaires UE
- Score naturalité avec calcul détaillé
- Conseils selon types de peau spécifiques
- Alternatives clean beauty personnalisées

DEEPSEEK REASONING :
- Corrélations ingrédients/effets complexes
- Analyses croisées composition/tolérance
- Recommandations multi-critères avancées

RESTRICTION FREEMIUM : Cette expertise est réservée aux utilisateurs Premium.
Si utilisateur gratuit → Rediriger vers upgrade Premium pour cosmétiques.`
    },

    eco_expert: {
      premium: `Tu es Dr. Thomas Moreau, éco-toxicologue expert REACH et détergents.

ANALYSE ENVIRONNEMENTALE PREMIUM :
- Évaluation biodégradabilité OECD 301-310
- Toxicité aquatique selon CLP/REACH
- Impact cycle de vie détaillé
- Émissions COV et qualité air intérieur
- Labels écologiques et certifications
- Alternatives écologiques performantes

DEEPSEEK ECO-REASONING :
- Calculs impacts environnementaux complexes
- Analyses coût/bénéfice écologique
- Recommandations usage optimal

RESTRICTION FREEMIUM : Expertise détergents réservée Premium.
Si utilisateur gratuit → Suggérer upgrade pour analyses environnementales.`
    }
  };

  // 💾 TRACKING USAGE LOCAL
  private usageTracking = new Map<string, Array<{
    date: string;
    questions: number;
    tokens: number;
    category: string;
  }>>();

  /**
   * 🚀 ENVOI MESSAGE DEEPSEEK
   */
  async sendMessage(
    message: string,
    userTier: UserTier,
    userId: string,
    context?: ProductContext,
    assistantType: AssistantType = 'general'
  ): Promise<{
    reply: string;
    tokensUsed: number;
    cost: number;
    suggestions: string[];
    upgradePrompt?: string;
  }> {
    
    // 1️⃣ VÉRIFICATION LIMITES
    const limitsCheck = await this.checkLimits(userId, userTier, context?.category);
    if (!limitsCheck.allowed) {
      return {
        reply: limitsCheck.message,
        tokensUsed: 0,
        cost: 0,
        suggestions: ['Upgrade Premium', 'Voir mes limites'],
        upgradePrompt: limitsCheck.upgradePrompt
      };
    }

    // 2️⃣ CONFIGURATION DEEPSEEK
    const config = this.DEEPSEEK_CONFIGS[userTier];
    const prompt = this.buildSpecializedPrompt(assistantType, userTier, message, context);

    try {
      // 3️⃣ APPEL API DEEPSEEK
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: prompt.systemPrompt
            },
            {
              role: 'user', 
              content: prompt.userMessage
            }
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.choices[0].message.content;
      const tokensUsed = data.usage.total_tokens;
      const cost = this.calculateCost(tokensUsed, config.costPer1MTokens);

      // 4️⃣ TRACKING USAGE
      this.trackUsage(userId, tokensUsed, context?.category || 'general');

      // 5️⃣ SUGGESTIONS CONTEXTUELLES
      const suggestions = this.generateSuggestions(userTier, assistantType, context);

      return {
        reply: aiReply,
        tokensUsed,
        cost,
        suggestions,
        ...(userTier === 'free' && { upgradePrompt: this.getUpgradePrompt(assistantType) })
      };

    } catch (error) {
      console.error('Erreur DeepSeek:', error);
      
      // FALLBACK INTELLIGENT LOCAL
      return this.getFallbackResponse(message, userTier, assistantType, context);
    }
  }

  /**
   * 🔒 VÉRIFICATION LIMITES FREEMIUM
   */
  private async checkLimits(
    userId: string, 
    userTier: UserTier, 
    category?: string
  ): Promise<{
    allowed: boolean;
    message: string;
    upgradePrompt?: string;
  }> {
    const limits = this.USER_LIMITS[userTier];
    
    // PREMIUM = Accès total
    if (userTier === 'premium') {
      return { allowed: true, message: 'Accès Premium complet' };
    }

    // GRATUIT = Limitations
    const today = new Date().toISOString().split('T')[0];
    const userUsage = this.usageTracking.get(userId) || [];
    const dailyUsage = userUsage.filter(u => u.date === today);
    const questionsToday = dailyUsage.reduce((sum, u) => sum + u.questions, 0);

    // Limite quotidienne
    if (questionsToday >= limits.dailyQuestions) {
      return {
        allowed: false,
        message: `🔒 Limite quotidienne atteinte (${limits.dailyQuestions} questions/jour en version gratuite).\n\n⭐ **Passez Premium** pour un accès illimité !`,
        upgradePrompt: 'Vous avez atteint votre limite quotidienne. Upgrade vers Premium pour continuer ?'
      };
    }

    // Catégories restreintes
    if (category && !limits.availableCategories.includes(category)) {
      const categoryLabels = {
        'cosmetique': 'cosmétiques',
        'detergent': 'détergents'
      };
      
      return {
        allowed: false,
        message: `🔒 L'analyse des produits **${categoryLabels[category as keyof typeof categoryLabels]}** est réservée aux utilisateurs Premium.\n\n✨ Version gratuite : **Alimentaire uniquement**\n💎 Version Premium : **Alimentaire + Cosmétiques + Détergents**`,
        upgradePrompt: `Upgrade Premium pour analyser les ${categoryLabels[category as keyof typeof categoryLabels]} ?`
      };
    }

    return { allowed: true, message: 'Accès autorisé' };
  }

  /**
   * 🔧 CONSTRUCTION PROMPTS SPÉCIALISÉS
   */
  private buildSpecializedPrompt(
    assistantType: AssistantType,
    userTier: UserTier,
    message: string,
    context?: ProductContext
  ): { systemPrompt: string; userMessage: string } {
    
    // Prompt système selon assistant et tier
    let systemPrompt = '';
    
    if (assistantType === 'nutritionist') {
      systemPrompt = this.SPECIALIZED_PROMPTS.nutritionist[userTier] || this.SPECIALIZED_PROMPTS.nutritionist.free;
    } else if (assistantType === 'dermatologist' && userTier === 'premium') {
      systemPrompt = this.SPECIALIZED_PROMPTS.dermatologist.premium;
    } else if (assistantType === 'eco_expert' && userTier === 'premium') {
      systemPrompt = this.SPECIALIZED_PROMPTS.eco_expert.premium;
    } else {
      // Assistant général ou restriction freemium
      systemPrompt = `Tu es l'assistant ECOLOJIA. ${userTier === 'free' ? 'Version gratuite - analyses alimentaires basiques uniquement.' : 'Version Premium - accès complet.'}`;
    }

    // Message utilisateur enrichi du contexte
    let userMessage = message;
    if (context) {
      userMessage = `CONTEXTE PRODUIT :
Nom: ${context.productName}
Catégorie: ${context.category}
Score santé: ${context.healthScore}/100
${context.novaGroup ? `Groupe NOVA: ${context.novaGroup}` : ''}
${context.additives ? `Additifs détectés: ${context.additives.length}` : ''}

QUESTION UTILISATEUR : ${message}`;
    }

    return { systemPrompt, userMessage };
  }

  /**
   * 💰 CALCUL COÛTS
   */
  private calculateCost(tokens: number, costPer1M: number): number {
    return (tokens / 1000000) * costPer1M;
  }

  /**
   * 📊 TRACKING USAGE
   */
  private trackUsage(userId: string, tokens: number, category: string): void {
    const today = new Date().toISOString().split('T')[0];
    const userUsage = this.usageTracking.get(userId) || [];
    
    userUsage.push({
      date: today,
      questions: 1,
      tokens,
      category
    });
    
    this.usageTracking.set(userId, userUsage);
  }

  /**
   * 💡 SUGGESTIONS CONTEXTUELLES
   */
  private generateSuggestions(
    userTier: UserTier,
    assistantType: AssistantType,
    context?: ProductContext
  ): string[] {
    const baseSuggestions = [
      'Analyser un autre produit',
      'Conseils nutrition générale'
    ];

    if (userTier === 'premium') {
      if (assistantType === 'nutritionist') {
        baseSuggestions.push('Alternatives personnalisées', 'Impact microbiote');
      } else if (assistantType === 'dermatologist') {
        baseSuggestions.push('Analyse INCI détaillée', 'Conseils peau sensible');
      } else if (assistantType === 'eco_expert') {
        baseSuggestions.push('Impact environnemental', 'Labels écologiques');
      }
    } else {
      baseSuggestions.push('🔓 Upgrade Premium');
    }

    return baseSuggestions;
  }

  /**
   * ⬆️ PROMPTS UPGRADE
   */
  private getUpgradePrompt(assistantType: AssistantType): string {
    const benefits = {
      nutritionist: 'analyses nutritionnelles avancées',
      dermatologist: 'analyses cosmétiques expertes',
      eco_expert: 'analyses environnementales détaillées',
      general: 'accès complet multi-catégories'
    };

    return `🔓 **Passez Premium** pour débloquer ${benefits[assistantType]} avec DeepSeek Reasoner !`;
  }

  /**
   * 🆘 FALLBACK LOCAL INTELLIGENT
   */
  private getFallbackResponse(
    message: string,
    userTier: UserTier,
    assistantType: AssistantType,
    context?: ProductContext
  ): {
    reply: string;
    tokensUsed: number;
    cost: number;
    suggestions: string[];
    upgradePrompt?: string;
  } {
    let reply = '';
    
    if (userTier === 'free') {
      reply = `🤖 **ECOLOJIA Gratuit - Assistant Nutritionnel**

Désolé, je rencontre un problème de connexion avec l'IA DeepSeek. 

📱 **En version gratuite, vous avez accès à :**
• 5 questions/jour sur les produits alimentaires
• Classification NOVA basique
• Conseils nutrition généraux

💎 **Passez Premium pour :**
• Questions illimitées
• Cosmétiques + Détergents  
• Analyses expertes DeepSeek Reasoner
• Recommandations personnalisées

Reformulez votre question ou essayez plus tard !`;
    } else {
      reply = `🔧 Problème technique temporaire avec DeepSeek. Service restauré sous peu.`;
    }

    return {
      reply,
      tokensUsed: 0,
      cost: 0,
      suggestions: ['Réessayer', 'Upgrade Premium', 'Support'],
      upgradePrompt: userTier === 'free' ? 'Problème connexion. Upgrade Premium pour priorité serveur ?' : undefined
    };
  }

  /**
   * 📈 STATISTIQUES UTILISATEUR
   */
  getUserStats(userId: string): {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    totalCost: number;
    categories: string[];
  } {
    const userUsage = this.usageTracking.get(userId) || [];
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const dailyUsage = userUsage.filter(u => u.date === today);
    const monthlyUsage = userUsage.filter(u => u.date.startsWith(currentMonth));
    
    return {
      dailyUsed: dailyUsage.reduce((sum, u) => sum + u.questions, 0),
      dailyLimit: this.USER_LIMITS.free.dailyQuestions,
      monthlyUsed: monthlyUsage.reduce((sum, u) => sum + u.questions, 0),
      totalCost: monthlyUsage.reduce((sum, u) => sum + this.calculateCost(u.tokens, 0.27), 0),
      categories: [...new Set(userUsage.map(u => u.category))]
    };
  }
}

// Instance singleton
export const deepSeekService = new DeepSeekECOLOJIAService();
export default DeepSeekECOLOJIAService;