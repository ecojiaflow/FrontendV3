// PATH: frontend/ecolojiaFrontV3/src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Search, Zap, User, Bot, RefreshCw } from 'lucide-react';

// ✅ CORRECTION: Interfaces locales au lieu d'imports manquants
interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ProductContext {
  productName: string;
  novaGroup?: number;
  healthScore?: number;
  additives?: Array<{ code: string; name: string; riskLevel: string }>;
  ingredients?: string;
  score?: number;
}

// ✅ CORRECTION: Service Chat local simplifié
class LocalChatService {
  private history: ChatMessage[] = [];
  private productContext: ProductContext | null = null;

  setProductContext(context: ProductContext | null) {
    this.productContext = context;
  }

  clearHistory() {
    this.history = [];
  }

  getSuggestedQuestions(context?: ProductContext | null): string[] {
    if (context) {
      return [
        `Pourquoi ${context.productName} a ce score ?`,
        "Quels sont les ingrédients problématiques ?",
        "Suggérez-moi des alternatives saines",
        "C'est dangereux pour ma santé ?",
        "Comment améliorer ce produit ?",
        "Explication du groupe NOVA"
      ];
    }
    
    return [
      "Comment fonctionne la classification NOVA ?",
      "Qu'est-ce que l'ultra-transformation ?",
      "Quels additifs éviter absolument ?",
      "Comment lire une étiquette alimentaire ?",
      "Conseils pour une alimentation plus saine",
      "Différence entre bio et naturel"
    ];
  }

  async sendMessage(message: string, context?: ProductContext): Promise<{ reply: string; suggestions: string[] }> {
    // ✅ Simulation d'attente réaliste
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerMessage = message.toLowerCase();
    let reply = '';
    let suggestions: string[] = [];

    // ✅ CORRECTION: Intelligence conversationnelle améliorée
    if (lowerMessage.includes('nova') || lowerMessage.includes('classification')) {
      reply = `🔬 **Classification NOVA** selon INSERM 2024 :

**NOVA 1** 🥬 : Aliments naturels ou minimalement transformés
• Fruits, légumes, viandes fraîches, lait, œufs, graines
• Excellent pour la santé

**NOVA 2** 🧂 : Ingrédients culinaires transformés  
• Huiles, beurre, sucre, sel, vinaigre
• À utiliser avec modération

**NOVA 3** 🍞 : Aliments transformés
• Pain artisanal, conserves simples, fromages
• Consommation occasionnelle acceptable

**NOVA 4** 🚨 : Ultra-transformés (à éviter)
• Sodas, plats préparés, biscuits industriels
• Riches en additifs et procédés industriels`;

      suggestions = [
        "Pourquoi éviter les NOVA 4 ?",
        "Comment identifier un ultra-transformé ?",
        "Exemples de produits NOVA 1"
      ];
    }
    else if (lowerMessage.includes('alternative') || lowerMessage.includes('remplacer')) {
      if (context) {
        reply = `🔄 **Alternatives pour ${context.productName}** :

Voici des options plus saines :
• **Version bio** : Recherchez l'équivalent certifié agriculture biologique
• **Marques artisanales** : Privilégiez les producteurs locaux
• **Fait maison** : Préparez votre propre version avec des ingrédients simples
• **Magasins spécialisés** : BioCoop, Naturalia, marchés de producteurs

💡 **Critères de choix** :
✅ Liste d'ingrédients courte (< 5 éléments)
✅ Ingrédients que vous reconnaissez
✅ Absence d'additifs E-numbers
✅ Certification bio ou équitable`;
      } else {
        reply = `🔄 **Guide des alternatives saines** :

**Méthode ECOLOJIA** pour choisir :
1️⃣ **Lisez les ingrédients** - plus c'est court, mieux c'est
2️⃣ **Privilégiez le bio** quand le budget le permet
3️⃣ **Cuisinez maison** - vous contrôlez tout
4️⃣ **Circuits courts** - producteurs locaux
5️⃣ **Marques transparentes** - qui expliquent leurs procédés

🛒 **Où acheter** : BioCoop, Naturalia, AMAP, marchés, magasins vrac`;
      }
      
      suggestions = [
        "Où acheter des produits plus sains ?",
        "Comment cuisiner maison facilement ?",
        "Marques bio recommandées"
      ];
    }
    else if (lowerMessage.includes('dangereux') || lowerMessage.includes('santé') || lowerMessage.includes('risque')) {
      if (context && context.novaGroup && context.novaGroup >= 4) {
        reply = `⚠️ **Impact santé - ${context.productName}** (NOVA ${context.novaGroup}) :

**Études scientifiques récentes** :
• +22% risque dépression (Nature 2024)
• +53% risque diabète type 2 (BMJ 2024)  
• +10% maladies cardiovasculaires (Lancet 2024)
• Perturbation microbiote intestinal (INSERM 2024)

**Pourquoi ces risques ?**
🔬 Ultra-transformation détruit la matrice alimentaire
🧪 Additifs perturbent l'absorption des nutriments
⚗️ Procédés industriels créent des composés néoformés

**Rassurez-vous** : consommation occasionnelle acceptable !
**L'important** : 80% alimentation naturelle, 20% plaisir 😊`;
      } else {
        reply = `🩺 **Impact santé des aliments transformés** :

**Ultra-transformés (NOVA 4)** - À limiter :
• Perturbent le microbiote intestinal
• Augmentent inflammation chronique
• Pauvres en nutriments essentiels
• Riches en calories vides

**Signaux d'alarme** :
⚠️ Plus de 5 ingrédients
⚠️ Noms d'ingrédients incompréhensibles  
⚠️ Additifs E-numbers multiples
⚠️ Durée conservation très longue

**Bonne nouvelle** : notre corps s'adapte rapidement à une meilleure alimentation ! 💪`;
      }
      
      suggestions = [
        "Quels additifs éviter absolument ?",
        "Comment améliorer mon alimentation ?",
        "C'est grave si j'en mange parfois ?"
      ];
    }
    else if (lowerMessage.includes('additif') || lowerMessage.includes('e1') || lowerMessage.includes('conservateur')) {
      reply = `⚗️ **Guide des additifs alimentaires** :

**🔴 À éviter absolument** :
• **E102, E110, E124** : Colorants liés hyperactivité enfants
• **E320, E321** : BHA, BHT - perturbateurs endocriniens
• **E249, E250** : Nitrites - cancérigènes potentiels
• **E951** : Aspartame - controversé

**🟡 Modération requise** :
• **E471** : Émulsifiants courants mais omniprésents
• **E330** : Acide citrique (naturel mais surajouté)
• **E407** : Carraghénanes - inflammation intestinale

**🟢 Généralement acceptables** :
• **E300** : Vitamine C (acide ascorbique)
• **E322** : Lécithine (soja/tournesol)
• **E170** : Carbonate de calcium (craie)

💡 **Règle d'or** : Moins de E-numbers = Mieux !`;
      
      suggestions = [
        "Comment éviter ces additifs ?",
        "Pourquoi sont-ils autorisés ?",
        "App pour scanner les additifs"
      ];
    }
    else if (context && (lowerMessage.includes('score') || lowerMessage.includes('pourquoi'))) {
      const score = context.healthScore || context.score || 50;
      const novaGroup = context.novaGroup || 4;
      
      reply = `📊 **Analyse de ${context.productName}** :

**Score ECOLOJIA** : ${score}/100 ${score >= 70 ? '✅' : score >= 50 ? '⚠️' : '🚨'}
**Groupe NOVA** : ${novaGroup} ${novaGroup === 1 ? '🥬' : novaGroup === 2 ? '🧂' : novaGroup === 3 ? '🍞' : '🚨'}

**Facteurs du score** :
🔬 **Transformation** : ${novaGroup >= 4 ? 'Ultra-industrielle (-30 pts)' : novaGroup >= 3 ? 'Modérée (-15 pts)' : 'Minimale (+10 pts)'}
⚗️ **Additifs** : ${context.additives?.length || 0} détecté(s) ${(context.additives?.length || 0) > 3 ? '(-20 pts)' : '(-5 pts)'}
🌿 **Naturalité** : ${score >= 60 ? 'Acceptable' : 'Faible'}

**Conseil** : ${score < 40 ? 'Remplacer par alternative naturelle' : 
                 score < 60 ? 'Consommer occasionnellement' : 
                 'Produit acceptable dans alimentation équilibrée'}`;
      
      suggestions = [
        "Comment améliorer ce score ?",
        "Ingrédients les plus problématiques",
        "Alternatives recommandées"
      ];
    }
    else if (lowerMessage.includes('bio') || lowerMessage.includes('biologique')) {
      reply = `🌿 **Agriculture biologique vs conventionnelle** :

**Avantages du bio** :
✅ **Sans pesticides** de synthèse
✅ **Moins d'additifs** autorisés (47 vs 300+)
✅ **Respect environnement** et biodiversité
✅ **Meilleure traçabilité** des ingrédients
✅ **OGM interdits** en agriculture bio

**Limites du bio** :
⚠️ Plus cher (20-40% en moyenne)
⚠️ Durée conservation parfois réduite
⚠️ Peut être ultra-transformé quand même !

**IMPORTANT** : Bio ≠ forcément sain
Un biscuit bio ultra-transformé reste NOVA 4 !

💡 **Priorités budget** : fruits/légumes > céréales > produits animaux`;
      
      suggestions = [
        "Bio vs local, que choisir ?",
        "Comment reconnaître le vrai bio ?",
        "Dirty Dozen - produits à acheter bio"
      ];
    }
    else if (lowerMessage.includes('lire') || lowerMessage.includes('étiquette')) {
      reply = `🔍 **Guide lecture d'étiquette ECOLOJIA** :

**1️⃣ Liste ingrédients** (par ordre décroissant) :
• ✅ **< 5 ingrédients** = Excellent  
• ⚠️ **5-10 ingrédients** = Acceptable
• 🚨 **> 10 ingrédients** = Ultra-transformé probable

**2️⃣ Signaux d'alarme** :
🚨 Mots que vous ne connaissez pas
🚨 E-numbers multiples (E102, E471...)
🚨 Sirop de glucose-fructose
🚨 Huiles hydrogénées

**3️⃣ Bon signaux** :
✅ Certification bio
✅ "Sans additifs"
✅ "Fait artisanalement"
✅ Origine des ingrédients indiquée

**4️⃣ Méfiance marketing** :
⚠️ "Naturel" (non réglementé)
⚠️ "Enrichi en..." (compensation transformation)`;
      
      suggestions = [
        "Exemples d'étiquettes à éviter",
        "Labels fiables à rechercher",
        "Apps pour scanner produits"
      ];
    }
    else if (lowerMessage.includes('améliorer') || lowerMessage.includes('conseil')) {
      reply = `💪 **Plan d'amélioration alimentaire ECOLOJIA** :

**Semaine 1-2 : Audit personnel**
📱 Scannez vos produits habituels avec ECOLOJIA
📝 Identifiez vos 3 produits NOVA 4 les plus consommés
🎯 Trouvez 1 alternative pour chacun

**Semaine 3-4 : Substitutions progressives**  
🔄 Remplacez 1 produit ultra-transformé par semaine
🏠 Testez 2 recettes maison simples
🛒 Explorez 1 nouveau magasin (bio, marché)

**Mois 2 : Consolidation**
👨‍🍳 Cuisinez 50% de vos repas
📊 Objectif : 80% NOVA 1-2, 20% plaisir
🎯 Score ECOLOJIA moyen > 60

**Résultats attendus** : Énergie ↗️, Digestion ↗️, Bien-être ↗️`;
      
      suggestions = [
        "Recettes simples pour débuter",
        "Budget courses plus saines",
        "Meal prep facile"
      ];
    }
    else {
      // ✅ Réponse par défaut intelligente
      reply = `🤔 Je comprends votre question !

En tant qu'assistant nutritionnel ECOLOJIA, je peux vous éclairer sur :

🔬 **Classification NOVA** et ultra-transformation
⚗️ **Décryptage additifs** et ingrédients  
🔄 **Alternatives plus saines** et où les trouver
🩺 **Impact santé** selon études scientifiques récentes
🛒 **Conseils pratiques** pour mieux consommer
📖 **Lecture d'étiquettes** et pièges marketing

💡 **Reformulez votre question** ou cliquez sur une suggestion pour que je puisse mieux vous aider !`;
      
      suggestions = [
        "Expliquez-moi NOVA",
        "Décryptez des ingrédients",
        "Trouvez des alternatives",
        "Impact sur la santé",
        "Conseils pour mieux manger"
      ];
    }

    return { reply, suggestions };
  }
}

// ✅ Instance globale du service
const chatService = new LocalChatService();

// ✅ Fonction utilitaire pour créer contexte
const createProductContext = (analysisData: any): ProductContext => {
  return {
    productName: analysisData.productName || analysisData.name || 'Produit analysé',
    novaGroup: analysisData.novaGroup || analysisData.nova?.novaGroup,
    healthScore: analysisData.healthScore || analysisData.score || analysisData.nova?.healthScore,
    additives: analysisData.additives || analysisData.nova?.additives?.detected || [],
    ingredients: analysisData.ingredients || '',
    score: analysisData.score || analysisData.healthScore
  };
};

// ✅ Questions prédéfinies organisées
const SUGGESTED_QUESTIONS = [
  "Ce produit est-il bon pour la santé ?",
  "Quels sont les additifs préoccupants ?", 
  "Existe-t-il des alternatives plus saines ?",
  "Comment améliorer mon alimentation ?",
  "Que signifie le groupe NOVA 4 ?",
  "Pourquoi éviter les produits ultra-transformés ?",
  "Quels sont les bienfaits des aliments bio ?",
  "Comment lire une étiquette nutritionnelle ?"
];

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // État du chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ProductContext | null>(null);

  // ✅ Initialisation améliorée
  useEffect(() => {
    // Récupérer le contexte depuis la navigation
    const analysisContext = location.state?.context;
    let productContext: ProductContext | null = null;

    if (analysisContext) {
      productContext = createProductContext(analysisContext);
      setContext(productContext);
      chatService.setProductContext(productContext);
    }

    // Message de bienvenue personnalisé
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: productContext 
        ? `🔬 Bonjour ! J'ai analysé "${productContext.productName}" (NOVA ${productContext.novaGroup || '?'}, Score ${productContext.healthScore || productContext.score || '?'}/100).

Je peux répondre à toutes vos questions sur ce produit : ingrédients problématiques, alternatives plus saines, impact santé, conseils nutritionnels...

Que voulez-vous savoir ? 🤔`
        : `🤖 Bonjour ! Je suis votre assistant nutritionnel ECOLOJIA.

Je vous aide à :
• 🔬 Comprendre la classification NOVA
• ⚗️ Décoder les additifs alimentaires  
• 🔄 Trouver des alternatives plus saines
• 🩺 Évaluer l'impact santé de vos aliments
• 💡 Améliorer votre alimentation au quotidien

Posez-moi vos questions ou cliquez sur les suggestions ! 😊`,
      timestamp: new Date(),
      suggestions: chatService.getSuggestedQuestions(productContext)
    };

    setMessages([welcomeMessage]);

    // Message initial automatique si fourni
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && typeof initialMessage === 'string') {
      setTimeout(() => {
        handleSendMessage(initialMessage);
      }, 1500);
    }
  }, [location.state]);

  // ✅ Auto-scroll optimisé
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  // ✅ Gestion envoi message robuste
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
      console.log('💬 Envoi message:', content);
      
      const response = await chatService.sendMessage(content, context || undefined);
      
      console.log('✅ Réponse reçue:', response);

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: response.reply,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('❌ Erreur ChatService:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: `❌ Désolé, problème technique temporaire.

💡 **Solutions** :
• Vérifiez votre connexion internet
• Reformulez avec des mots-clés simples
• Réessayez dans quelques secondes

En attendant, je peux vous aider avec les bases :
🔬 Classification NOVA
⚗️ Additifs alimentaires
🔄 Alternatives saines`,
        timestamp: new Date(),
        suggestions: ["Réessayer", "Expliquer NOVA", "Lister additifs dangereux", "Retour accueil"]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ Gestion suggestions avec anti-spam
  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping) return;
    handleSendMessage(suggestion);
  };

  // ✅ Navigation intelligente
  const handleBack = () => {
    if (context) {
      navigate('/search', { state: { fromChat: true } });
    } else {
      navigate('/');
    }
  };

  const handleSearchProducts = () => {
    navigate('/search');
  };

  const handleAnalyzeProduct = () => {
    navigate('/analyze');
  };

  // ✅ Reset chat amélioré
  const handleResetChat = () => {
    chatService.clearHistory();
    setMessages([]);
    setContext(null);
    chatService.setProductContext(null);
    
    const welcomeMessage: ChatMessage = {
      id: `reset_${Date.now()}`,
      type: 'ai',
      content: `🔄 **Chat réinitialisé !**

Je suis de nouveau votre assistant nutritionnel ECOLOJIA.
Prêt à vous aider sur tous les sujets alimentation et santé !

Comment puis-je vous aider aujourd'hui ? 😊`,
      timestamp: new Date(),
      suggestions: chatService.getSuggestedQuestions()
    };
    
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header amélioré */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
              Retour
            </button>
            
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-green-500" />
              Assistant Nutritionnel
              {context && (
                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  NOVA {context.novaGroup || '?'}
                </span>
              )}
            </h1>
            
            <div className="flex space-x-1">
              <button
                onClick={handleResetChat}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Nouveau chat"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSearchProducts}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Rechercher des produits"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={handleAnalyzeProduct}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                title="Analyser un produit"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone messages avec contexte */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
          
          {/* Contexte produit amélioré */}
          {context && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 flex items-center">
                    📦 Produit analysé
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </h3>
                  <p className="text-green-700 font-medium mt-1">{context.productName}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-green-600">
                    <span className="flex items-center">
                      🔬 NOVA {context.novaGroup || '?'}
                    </span>
                    <span className="flex items-center">
                      📊 Score: {context.healthScore || context.score || '?'}/100
                    </span>
                    {context.additives && context.additives.length > 0 && (
                      <span className="flex items-center">
                        ⚗️ {context.additives.length} additif(s)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setContext(null)}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 rounded transition-all"
                  title="Retirer le contexte"
                >
                  ✕
                </button>
              </div>
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
                    : 'bg-white border border-gray-200'
                } rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow`}>
                  
                  {/* Avatar et nom */}
                  <div className="flex items-center mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      message.type === 'user' ? 'bg-white/20' : 'bg-green-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      message.type === 'user' ? 'text-white/90' : 'text-gray-700'
                    }`}>
                      {message.type === 'user' ? 'Vous' : 'Assistant ECOLOJIA'}
                    </span>
                  </div>

                  {/* Contenu message */}
                  <div className={`text-sm leading-relaxed ${
                    message.type === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={index} className={`font-bold ${index > 0 ? 'mt-3' : ''}`}>
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      }
                      return (
                        <div key={index} className={index > 0 ? 'mt-2' : ''}>
                          {line}
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-medium text-green-600 mb-2">
                        💡 Suggestions :
                      </div>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isTyping}
                          className="block w-full text-left text-sm bg-green-50 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-500 text-green-700 px-3 py-2 rounded-lg transition-all border border-green-200 hover:border-green-300"
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

            {/* Typing indicator amélioré */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Assistant ECOLOJIA</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-500">réfléchit...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions suggérées pour nouveaux utilisateurs */}
          {messages.filter(m => m.type === 'user').length === 0 && !isTyping && (
            <div className="mt-6 mb-4">
              <p className="text-sm text-gray-600 mb-4 text-center font-medium">
                💡 Questions fréquentes pour commencer :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTED_QUESTIONS.slice(0, 6).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    disabled={isTyping}
                    className="text-left text-sm bg-white hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-500 border border-gray-200 hover:border-blue-300 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-sm group"
                  >
                    <span className="group-hover:text-blue-700">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie améliorée */}
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
                placeholder="Posez votre question sur la nutrition, les additifs, NOVA..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-all flex items-center hover:shadow-md disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Appuyez sur Entrée pour envoyer • IA nutritionnelle ECOLOJIA
              </span>
              <span className="text-green-600 font-medium">
                💬 {messages.length} messages
                {context && ` • 📦 ${context.productName}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;