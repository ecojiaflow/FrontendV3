// PATH: frontend/ecolojiaFrontV3/src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Search, Zap, User, Bot, RefreshCw, Crown, Lock, Calculator, Clock, AlertTriangle } from 'lucide-react';

// ✅ TYPES DEEPSEEK INTÉGRÉS
type UserTier = 'free' | 'premium';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  cost?: number;
  tokens?: number;
}

interface ProductContext {
  productName: string;
  category: 'alimentaire' | 'cosmetique' | 'detergent';
  novaGroup?: number;
  healthScore?: number;
  additives?: Array<{ code: string; name: string; riskLevel: string }>;
  ingredients?: string;
  score?: number;
  // Cosmétique
  inciIngredients?: string[];
  naturalityScore?: number;
  // Détergent
  ecoScore?: number;
  biodegradability?: string;
}

// 🚀 SERVICE DEEPSEEK PRODUCTION AVEC VRAIE API
class DeepSeekProductionService {
  private readonly API_KEY = 'sk-ef74bf314166463ebbd45badd4eb6de7'; // Votre vraie clé API
  private readonly BASE_URL = 'https://api.deepseek.com/v1/chat/completions';
  private readonly PRODUCTION_MODE = true; // Mode production activé
  
  // Usage tracking local
  private usageStorage = new Map<string, Array<{
    date: string;
    questions: number;
    tokens: number;
    cost: number;
  }>>();

  async sendMessage(
    message: string,
    userTier: UserTier,
    userId: string,
    context?: ProductContext
  ): Promise<{
    reply: string;
    suggestions: string[];
    cost: number;
    tokens: number;
    upgradePrompt?: string;
  }> {
    
    // Vérification limites gratuit
    if (userTier === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const userUsage = this.usageStorage.get(userId) || [];
      const dailyUsage = userUsage.filter(u => u.date === today);
      const questionsToday = dailyUsage.reduce((sum, u) => sum + u.questions, 0);

      if (questionsToday >= 5) {
        return {
          reply: '🔒 **Limite quotidienne atteinte (5/5 questions)**\n\n⭐ **Passez Premium pour :**\n• Questions illimitées\n• Cosmétiques + Détergents\n• DeepSeek Reasoner (IA avancée)\n• Analyses expertes\n\n💰 **Coût réel** : ~0,02€ par question Premium',
          suggestions: ['Upgrade Premium', 'Voir mes limites'],
          cost: 0,
          tokens: 0,
          upgradePrompt: 'Limite atteinte. Upgrade Premium ?'
        };
      }

      // Vérifier catégorie autorisée
      if (context && context.category !== 'alimentaire') {
        const categoryName = context.category === 'cosmetique' ? 'cosmétiques' : 'détergents';
        return {
          reply: `🔒 **Analyse ${categoryName} réservée Premium**\n\n✨ **Version gratuite** : Alimentaire uniquement\n💎 **Version Premium** : Alimentaire + Cosmétiques + Détergents\n\nUpgrade pour analyser "${context.productName}" ?`,
          suggestions: ['Upgrade Premium', 'Retour alimentaire'],
          cost: 0,
          tokens: 0,
          upgradePrompt: `Upgrade pour analyser ${categoryName} ?`
        };
      }
    }

    // 🚀 APPEL API DEEPSEEK RÉEL
    try {
      console.log('🚀 Appel DeepSeek API Production...');
      
      const model = userTier === 'premium' ? 'deepseek-reasoner' : 'deepseek-chat';
      const systemPrompt = this.buildSystemPrompt(userTier, context);
      const userMessage = this.buildUserMessage(message, context);

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.1,
          max_tokens: userTier === 'premium' ? 2000 : 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Erreur API DeepSeek:', response.status, errorData);
        
        // Fallback en cas d'erreur API
        return this.getFallbackResponse(message, userTier, context, userId);
      }

      const data = await response.json();
      
      // Extraction des données de réponse
      const aiReply = data.choices[0]?.message?.content || 'Erreur de réponse DeepSeek';
      const usage = data.usage;
      const totalTokens = usage?.total_tokens || 0;
      
      // Calcul coût réel selon modèle
      const inputCost = userTier === 'premium' ? 0.55 : 0.27; // $ per 1M tokens
      const outputCost = userTier === 'premium' ? 2.19 : 1.10; // $ per 1M tokens
      const inputTokens = usage?.prompt_tokens || 0;
      const outputTokens = usage?.completion_tokens || 0;
      
      const realCost = (inputTokens * inputCost / 1000000) + (outputTokens * outputCost / 1000000);

      // Tracking usage
      this.trackUsage(userId, totalTokens, realCost);

      console.log('✅ Réponse DeepSeek reçue:', {
        model,
        tokens: totalTokens,
        cost: realCost.toFixed(6) + '$'
      });

      return {
        reply: aiReply,
        suggestions: this.generateSuggestions(userTier, context),
        cost: realCost,
        tokens: totalTokens
      };

    } catch (error) {
      console.error('❌ Erreur réseau DeepSeek:', error);
      return this.getFallbackResponse(message, userTier, context, userId);
    }
  }

  private buildSystemPrompt(userTier: UserTier, context?: ProductContext): string {
    if (userTier === 'free') {
      return `Tu es un assistant nutritionnel ECOLOJIA gratuit alimenté par DeepSeek Chat.

LIMITATIONS VERSION GRATUITE :
- Analyses alimentaires basiques uniquement
- Classification NOVA simple selon INSERM 2024
- Réponses concises (max 400 mots)
- Conseils généraux nutrition

EXPERTISE DISPONIBLE :
- Classification NOVA 1-4 avec explications
- Additifs E-numbers courants et risques EFSA
- Conseils nutrition équilibrée
- Identification ultra-transformation

STYLE : Accessible, bienveillant, scientifiquement rigoureux, encourage naturellement upgrade Premium pour analyses expertes.

SOURCES : INSERM, ANSES, EFSA 2024`;
    }

    // Premium - Assistant spécialisé selon catégorie
    if (context?.category === 'cosmetique') {
      return `Tu es Dr. Sophie Laurent, dermatologue et chimiste cosmétique experte INCI, alimentée par DeepSeek Reasoner.

EXPERTISE PREMIUM COSMÉTIQUES :
- Analyse INCI complète avec détection perturbateurs endocriniens
- Base Commission Européenne 2024 + ANSES cosmétiques
- Détection 26 allergènes réglementaires UE
- Score naturalité détaillé avec justifications
- Conseils selon types de peau (normale, sensible, acnéique)
- Alternatives clean beauty validées scientifiquement
- Analyse interactions ingrédients

APPROCHE : Utilise DeepSeek Reasoner pour analyses multi-factorielles approfondies.

SOURCES : ANSM, Commission Européenne, IFRA, CIR, SCCS`;
    }

    if (context?.category === 'detergent') {
      return `Tu es Dr. Thomas Moreau, éco-toxicologue expert REACH alimenté par DeepSeek Reasoner.

EXPERTISE PREMIUM DÉTERGENTS :
- Biodégradabilité selon tests OECD 301-310
- Toxicité vie aquatique (Daphnia, poissons, algues)
- Émissions COV et qualité air intérieur
- Conformité labels écologiques (Ecolabel EU, Nordic Swan)
- Alternatives écologiques efficaces
- Impact emballages et transport

APPROCHE : Utilise DeepSeek Reasoner pour évaluations environnementales complexes.

SOURCES : ECHA, OECD, EPA, Ecolabel Européen 2024`;
    }

    // Nutritionniste par défaut
    return `Tu es Dr. Marie Dubois, diététicienne-nutritionniste experte NOVA alimentée par DeepSeek Reasoner.

EXPERTISE PREMIUM ALIMENTAIRE :
- Classification NOVA détaillée avec justifications INSERM 2024
- Analyse additifs E-numbers + évaluation risques EFSA complète
- Impact microbiote intestinal selon recherches récentes
- Recommandations personnalisées selon profils (diabète, hypertension, etc.)
- Alternatives spécifiques avec équivalences nutritionnelles
- Analyse procédés industriels ultra-transformation

APPROCHE : Utilise DeepSeek Reasoner pour analyses nutritionnelles systémiques.

SOURCES : INSERM, ANSES, EFSA, BMJ Nutrition 2024`;
  }

  private buildUserMessage(message: string, context?: ProductContext): string {
    if (!context) return message;

    let contextStr = `CONTEXTE PRODUIT ANALYSÉ :
Nom: ${context.productName}
Catégorie: ${context.category}
Score santé ECOLOJIA: ${context.healthScore || context.score}/100`;

    if (context.novaGroup) {
      contextStr += `\nGroupe NOVA: ${context.novaGroup}`;
    }

    if (context.additives && context.additives.length > 0) {
      contextStr += `\nAdditifs détectés: ${context.additives.length}`;
      contextStr += `\nDétail additifs: ${context.additives.map(a => `${a.code} (${a.name}, risque: ${a.riskLevel})`).join(', ')}`;
    }

    if (context.ingredients) {
      contextStr += `\nIngrédients: ${context.ingredients.substring(0, 200)}${context.ingredients.length > 200 ? '...' : ''}`;
    }

    // Cosmétiques
    if (context.category === 'cosmetique') {
      if (context.inciIngredients) {
        contextStr += `\nIngrédients INCI: ${context.inciIngredients.join(', ')}`;
      }
      if (context.naturalityScore) {
        contextStr += `\nScore naturalité: ${context.naturalityScore}/100`;
      }
    }

    // Détergents
    if (context.category === 'detergent') {
      if (context.ecoScore) {
        contextStr += `\nScore écologique: ${context.ecoScore}/100`;
      }
      if (context.biodegradability) {
        contextStr += `\nBiodégradabilité: ${context.biodegradability}`;
      }
    }

    return `${contextStr}

QUESTION UTILISATEUR : ${message}`;
  }

  private generateSuggestions(userTier: UserTier, context?: ProductContext): string[] {
    if (userTier === 'free') {
      return [
        'Classification NOVA ?',
        'Additifs dangereux ?',
        'Upgrade Premium',
        'Conseils nutrition'
      ];
    }

    // Premium suggestions selon contexte
    if (context?.category === 'cosmetique') {
      return [
        'Analyse INCI complète',
        'Perturbateurs endocriniens',
        'Conseils peau sensible',
        'Alternatives naturelles'
      ];
    }

    if (context?.category === 'detergent') {
      return [
        'Impact environnemental',
        'Biodégradabilité OECD',
        'Labels écologiques',
        'Usage éco-responsable'
      ];
    }

    return [
      'Analyse nutritionnelle',
      'Alternatives saines',
      'Impact microbiote',
      'Conseils personnalisés'
    ];
  }

  private getFallbackResponse(message: string, userTier: UserTier, context?: ProductContext, userId?: string): any {
    console.log('🔄 Fallback activé - IA Expert API indisponible');
    
    // Fallback intelligent basé sur les mots-clés
    const msg = message.toLowerCase();
    
    let reply = `⚠️ **Service IA temporairement indisponible**\n\n🔄 **Réponse de base ECOLOJIA** :\n\n`;
    
    if (msg.includes('nova')) {
      reply += `🔬 **Classification NOVA (INSERM 2024)** :\n• NOVA 1 🟢 : Aliments naturels\n• NOVA 2 🟡 : Ingrédients culinaires\n• NOVA 3 🟠 : Aliments transformés\n• NOVA 4 🔴 : Ultra-transformés (éviter)\n\n📚 Base : Recherches Carlos Monteiro, BMJ 2024`;
    } else if (context) {
      const score = context.healthScore || context.score || 50;
      const evaluation = score >= 70 ? 'Plutôt bon' : score >= 50 ? 'Modéré' : 'À améliorer';
      reply += `📊 "${context.productName}" - Score: ${score}/100 (${evaluation})\n\nService expert IA sera rétabli sous peu.`;
    } else {
      reply += `Notre IA experte sera rétablie sous peu.\n\nEn attendant, utilisez notre analyse ECOLOJIA de base.`;
    }

    reply += `\n\n🔧 **Statut** : Reconnexion automatique en cours...`;

    return {
      reply,
      suggestions: ['Réessayer', 'Support technique'],
      cost: 0,
      tokens: 0
    };
  }

  private trackUsage(userId: string, tokens: number, cost: number): void {
    const today = new Date().toISOString().split('T')[0];
    const userUsage = this.usageStorage.get(userId) || [];
    
    userUsage.push({
      date: today,
      questions: 1,
      tokens,
      cost
    });
    
    this.usageStorage.set(userId, userUsage);
  }

  getUserStats(userId: string) {
    const userUsage = this.usageStorage.get(userId) || [];
    const today = new Date().toISOString().split('T')[0];
    const dailyUsage = userUsage.filter(u => u.date === today);
    
    return {
      dailyUsed: dailyUsage.reduce((sum, u) => sum + u.questions, 0),
      dailyLimit: 5,
      monthlyUsed: userUsage.reduce((sum, u) => sum + u.questions, 0),
      totalCost: userUsage.reduce((sum, u) => sum + u.cost, 0),
      totalTokens: userUsage.reduce((sum, u) => sum + u.tokens, 0)
    };
  }

  // Méthode pour tester la connexion IA
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Test connexion IA Expert échoué:', error);
      return false;
    }
  }
}

// Instance service production
const deepSeekService = new DeepSeekProductionService();

// ✅ Fonction utilitaire pour créer contexte
const createProductContext = (analysisData: any): ProductContext => {
  return {
    productName: analysisData.productName || analysisData.name || 'Produit analysé',
    category: analysisData.category || 'alimentaire',
    novaGroup: analysisData.novaGroup || analysisData.nova?.novaGroup,
    healthScore: analysisData.healthScore || analysisData.score || analysisData.nova?.healthScore,
    additives: analysisData.additives || analysisData.nova?.additives?.detected || [],
    ingredients: analysisData.ingredients || '',
    score: analysisData.score || analysisData.healthScore
  };
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 🔧 ÉTAT DEEPSEEK PRODUCTION
  const [userTier, setUserTier] = useState<UserTier>('free'); // TODO: récupérer depuis auth
  const [userId] = useState('user_' + Date.now()); // TODO: vrai userId
  const [userStats, setUserStats] = useState({
    dailyUsed: 0,
    dailyLimit: 5,
    monthlyUsed: 0,
    totalCost: 0,
    totalTokens: 0
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  
  // État du chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ProductContext | null>(null);

  // ✅ Test connexion IA au démarrage
  useEffect(() => {
    const testApi = async () => {
      console.log('🔍 Test connexion IA Expert...');
      const isConnected = await deepSeekService.testConnection();
      setApiStatus(isConnected ? 'connected' : 'disconnected');
      console.log(isConnected ? '✅ IA Expert connectée' : '❌ IA Expert indisponible');
    };

    testApi();
  }, []);

  // ✅ Charger stats utilisateur
  useEffect(() => {
    const stats = deepSeekService.getUserStats(userId);
    setUserStats(stats);
  }, [userId, messages]);

  // ✅ Initialisation avec DeepSeek
  useEffect(() => {
    const analysisContext = location.state?.context;
    let productContext: ProductContext | null = null;

    if (analysisContext) {
      productContext = createProductContext(analysisContext);
      setContext(productContext);
    }

    // Message de bienvenue selon tier
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: getWelcomeMessage(userTier, productContext),
      timestamp: new Date(),
      suggestions: getSuggestions(userTier, productContext)
    };

    setMessages([welcomeMessage]);
  }, [userTier, location.state, apiStatus]);

  const getWelcomeMessage = (tier: UserTier, product?: ProductContext | null): string => {
    const statusIndicator = apiStatus === 'connected' ? '🟢 **IA Expert Connectée**' : 
                           apiStatus === 'disconnected' ? '🔴 **IA Expert Déconnectée**' : 
                           '🟡 **Connexion IA...**';

    if (tier === 'free') {
      const productText = product ? `J'ai analysé "${product.productName}" !` : 'Bonjour !';
      const questionText = product ? 'Que voulez-vous savoir ?' : 'Posez vos questions nutrition !';
      
      return `🤖 **ECOLOJIA Gratuit - IA Scientifique**\n\n${statusIndicator}\n\n${productText}\n\n📱 **Version Gratuite :**\n• ${userStats.dailyLimit - userStats.dailyUsed}/${userStats.dailyLimit} questions restantes aujourd'hui\n• Analyses alimentaires uniquement\n• IA de base (rapide et précise)\n\n💎 **Passez Premium pour :**\n• Questions illimitées\n• Cosmétiques + Détergents\n• IA Expert Avancée (raisonnement approfondi)\n\n${questionText}`;
    }

    const assistantName = getAssistantName(product);
    const productText = product ? `Analyse experte de "${product.productName}" !` : 'Accès complet à l\'expertise IA !';
    
    return `👑 **ECOLOJIA Premium - ${assistantName}**\n\n${statusIndicator}\n\n${productText}\n\n🚀 **Vos Avantages Premium :**\n• Questions illimitées (${userStats.monthlyUsed} ce mois)\n• IA Expert Avancée (analyses approfondies)\n• Toutes catégories disponibles\n• Service premium sans limitations\n\nComment puis-je vous aider aujourd'hui ?`;
  };

  const getAssistantName = (product?: ProductContext | null): string => {
    if (!product) return 'Assistant Expert';
    switch (product.category) {
      case 'cosmetique': return 'Dr. Sophie Laurent (Dermatologue)';
      case 'detergent': return 'Dr. Thomas Moreau (Éco-expert)';
      default: return 'Dr. Marie Dubois (Nutritionniste)';
    }
  };

  const getSuggestions = (tier: UserTier, product?: ProductContext | null): string[] => {
    if (tier === 'free') {
      return product 
        ? ['Ce produit est-il sain ?', 'Additifs problématiques', 'Upgrade Premium']
        : ['Classification NOVA', 'Additifs dangereux', 'Upgrade Premium'];
    }

    if (product?.category === 'cosmetique') {
      return ['Analyse INCI', 'Perturbateurs endocriniens', 'Conseils peau'];
    }
    if (product?.category === 'detergent') {
      return ['Impact environnemental', 'Biodégradabilité', 'Labels écologiques'];
    }
    return ['Analyse nutritionnelle', 'Alternatives saines', 'Impact santé'];
  };

  // ✅ Gestion envoi message DeepSeek PRODUCTION
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      console.log('📤 Envoi message à IA Expert Production...');
      
      const response = await deepSeekService.sendMessage(
        content,
        userTier,
        userId,
        context || undefined
      );

      // Vérifier upgrade prompt
      if (response.upgradePrompt) {
        setShowUpgradeModal(true);
      }

      // Mise à jour statut API si réussi
      if (apiStatus === 'disconnected') {
        setApiStatus('connected');
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response.reply,
        timestamp: new Date(),
        suggestions: response.suggestions,
        cost: response.cost,
        tokens: response.tokens
      };

      setMessages(prev => [...prev, aiMessage]);

      // Mettre à jour stats
      const newStats = deepSeekService.getUserStats(userId);
      setUserStats(newStats);
      
      console.log('✅ Réponse IA Expert reçue et traitée');
      
    } catch (error) {
      console.error('❌ Erreur IA Expert Production:', error);
      
      // Marquer API comme déconnectée
      setApiStatus('disconnected');
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: '❌ **Erreur IA Expert**\n\nLe service d\'IA rencontre des difficultés.\n\n🔄 **Actions possibles :**\n• Vérifiez votre connexion internet\n• Réessayez dans quelques instants\n• Contactez le support si le problème persiste\n\n💡 L\'analyse ECOLOJIA de base reste disponible.',
        timestamp: new Date(),
        suggestions: ['Réessayer', 'Support technique', 'Retour accueil']
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Upgrade Premium') {
      setShowUpgradeModal(true);
      return;
    }
    if (suggestion === 'Support technique') {
      // TODO: Ouvrir support
      console.log('Support technique demandé');
      return;
    }
    if (suggestion === 'Retour accueil') {
      navigate('/');
      return;
    }
    if (isTyping) return;
    handleSendMessage(suggestion);
  };

  const handleUpgrade = () => {
    // TODO: Intégrer système paiement
    setUserTier('premium');
    setShowUpgradeModal(false);
    console.log('Upgrade vers Premium');
  };

  const handleBack = () => {
    navigate(context ? '/search' : '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header avec tier et statut API */}
      <div className={`border-b sticky top-0 z-10 shadow-sm ${
        userTier === 'premium' 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className={`flex items-center font-medium transition-colors group ${
                userTier === 'premium' ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
              Retour
            </button>
            
            <div className="text-center">
              <h1 className={`text-xl font-bold flex items-center ${
                userTier === 'premium' ? 'text-white' : 'text-gray-800'
              }`}>
                {userTier === 'premium' ? (
                  <Crown className="w-6 h-6 mr-2 text-yellow-300" />
                ) : (
                  <MessageCircle className="w-6 h-6 mr-2 text-green-500" />
                )}
                {getAssistantName(context)}
              </h1>
              
              {/* Statut IA */}
              <div className="flex items-center justify-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  apiStatus === 'connected' ? 'bg-green-400' : 
                  apiStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <span className={`text-xs ${
                  userTier === 'premium' ? 'text-white/80' : 'text-gray-500'
                }`}>
                  IA Expert {apiStatus === 'connected' ? 'Connectée' : 
                           apiStatus === 'disconnected' ? 'Déconnectée' : 'Connexion...'}
                </span>
              </div>
            </div>
            
            {/* Stats usage */}
            <div className="text-right">
              {userTier === 'free' ? (
                <div>
                  <div className={`text-lg font-bold ${
                    userStats.dailyUsed >= userStats.dailyLimit ? 'text-red-600' : 
                    userTier === 'premium' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {userStats.dailyLimit - userStats.dailyUsed}/{userStats.dailyLimit}
                  </div>
                  <div className={`text-xs ${userTier === 'premium' ? 'text-white/70' : 'text-gray-500'}`}>
                    questions restantes
                  </div>
                  {userStats.dailyUsed >= userStats.dailyLimit - 1 && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-xs text-purple-600 hover:text-purple-700 mt-1"
                    >
                      🔓 Upgrade
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold">{userStats.monthlyUsed}</div>
                  <div className="text-xs opacity-75">questions ce mois</div>
                  <div className="text-xs mt-1">Service Premium</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contexte produit si présent */}
          {context && (
            <div className="mt-3 flex items-center justify-center">
              <span className={`text-sm px-3 py-1 rounded-full ${
                userTier === 'premium' 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-green-100 text-green-700'
              }`}>
                📦 {context.productName} • {context.category}
                {context.healthScore && ` • ${context.healthScore}/100`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Zone messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
          
          {/* Alert statut IA si déconnecté */}
          {apiStatus === 'disconnected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <div className="text-red-800 font-medium">IA Expert Déconnectée</div>
                <div className="text-red-600 text-sm">Les réponses peuvent être limitées. Reconnexion automatique...</div>
              </div>
              <button
                onClick={async () => {
                  setApiStatus('testing');
                  const isConnected = await deepSeekService.testConnection();
                  setApiStatus(isConnected ? 'connected' : 'disconnected');
                }}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md lg:max-w-2xl ${
                  message.type === 'user' 
                    ? 'bg-green-500 text-white' 
                    : message.type === 'system'
                    ? 'bg-red-100 border border-red-200 text-red-800'
                    : userTier === 'premium'
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-white border border-gray-200'
                } rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow`}>
                  
                  {/* Avatar et nom */}
                  <div className="flex items-center mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      message.type === 'user' ? 'bg-white/20' : 
                      userTier === 'premium' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className={`w-4 h-4 ${userTier === 'premium' ? 'text-purple-600' : 'text-green-600'}`} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      message.type === 'user' ? 'text-white/90' : 
                      message.type === 'system' ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {message.type === 'user' ? 'Vous' : getAssistantName(context)}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className={`text-sm leading-relaxed ${
                    message.type === 'user' ? 'text-white' : 
                    message.type === 'system' ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {message.content.split('\n').map((line, index) => (
                      <div key={index} className={index > 0 ? 'mt-2' : ''}>
                        <span dangerouslySetInnerHTML={{ 
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Métadonnées masquées pour utilisateur */}
                  {/* Les coûts et tokens sont trackés en arrière-plan mais non affichés */}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        💡 Suggestions :
                      </div>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isTyping}
                          className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-all border ${
                            suggestion === 'Upgrade Premium'
                              ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                          } disabled:opacity-50`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs mt-3 ${
                    message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`border rounded-2xl px-5 py-4 shadow-sm ${
                  userTier === 'premium' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      userTier === 'premium' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <Bot className={`w-4 h-4 ${userTier === 'premium' ? 'text-purple-600' : 'text-green-600'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{getAssistantName(context)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        userTier === 'premium' ? 'bg-purple-400' : 'bg-green-400'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        userTier === 'premium' ? 'bg-purple-400' : 'bg-green-400'
                      }`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        userTier === 'premium' ? 'bg-purple-400' : 'bg-green-400'
                      }`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-500">
                      IA Expert analyse...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4 shadow-sm">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
                placeholder={
                  userTier === 'free' 
                    ? `Question alimentaire (${userStats.dailyLimit - userStats.dailyUsed} restantes)...`
                    : 'Votre question experte...'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                disabled={isTyping || (userTier === 'free' && userStats.dailyUsed >= userStats.dailyLimit)}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping || (userTier === 'free' && userStats.dailyUsed >= userStats.dailyLimit)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
                  userTier === 'premium'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isTyping ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-400' : 
                  apiStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                IA Expert ECOLOJIA •
                {userTier === 'free' && ` ${userStats.dailyUsed}/${userStats.dailyLimit} questions`}
              </span>
              {userTier === 'free' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" />
                  Upgrade Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="text-center">
                <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">Upgrade vers Premium</h2>
                <p className="text-purple-100">
                  Débloquez l'IA Expert Avancée
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-5 h-5 text-green-600">♾️</div>
                  <div>
                    <div className="font-medium text-green-800">Questions illimitées</div>
                    <div className="text-sm text-green-600">Plus de limite quotidienne</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-5 h-5 text-blue-600">🧠</div>
                  <div>
                    <div className="font-medium text-blue-800">IA Expert Avancée</div>
                    <div className="text-sm text-blue-600">Analyses approfondies et raisonnement complexe</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-5 h-5 text-purple-600">🔬</div>
                  <div>
                    <div className="font-medium text-purple-800">Multi-catégories</div>
                    <div className="text-sm text-purple-600">Alimentaire + Cosmétiques + Détergents</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-5 h-5 text-orange-600">👥</div>
                  <div>
                    <div className="font-medium text-orange-800">Assistants Spécialisés</div>
                    <div className="text-sm text-orange-600">Nutritionniste • Dermatologue • Éco-expert</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 font-medium flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;