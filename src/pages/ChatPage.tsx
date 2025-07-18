// PATH: frontend/ecolojiaFrontV3/src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Search, Zap, User, Bot } from 'lucide-react';
import { chatService, createProductContext, type ChatMessage, type ProductContext } from '../services/chat/ChatService';

// ✅ Questions prédéfinies intelligentes
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

  // ✅ Initialisation avec message de bienvenue et contexte
  useEffect(() => {
    // Récupérer le contexte depuis la navigation (analyse NOVA)
    const analysisContext = location.state?.context;
    let productContext: ProductContext | null = null;

    if (analysisContext) {
      // Convertir le contexte d'analyse en contexte produit
      productContext = createProductContext(analysisContext);
      setContext(productContext);
      chatService.setProductContext(productContext);
    }

    // Récupérer le message initial si fourni
    const initialMessage = location.state?.initialMessage;

    // Message de bienvenue
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: productContext 
        ? `🔬 Bonjour ! J'ai vu que vous avez analysé "${productContext.productName}". Je peux répondre à vos questions sur ce produit ou vous donner des conseils nutritionnels !`
        : "🤖 Bonjour ! Je suis votre assistant nutritionnel ECOLOJIA.\n\nJe peux vous aider à comprendre les analyses NOVA, décoder les additifs alimentaires, et vous donner des conseils pour une alimentation plus saine.\n\nQue puis-je faire pour vous ?",
      timestamp: new Date(),
      suggestions: chatService.getSuggestedQuestions(productContext)
    };

    setMessages([welcomeMessage]);

    // Si message initial fourni, l'envoyer automatiquement
    if (initialMessage && typeof initialMessage === 'string') {
      setTimeout(() => {
        handleSendMessage(initialMessage);
      }, 1000);
    }
  }, [location.state]);

  // ✅ Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ✅ NOUVEAU: Gestion envoi message avec ChatService
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    // Ajouter message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // ✅ Utiliser ChatService au lieu de logique locale
      console.log('💬 Envoi message au ChatService:', content);
      
      const response = await chatService.sendMessage(content, context || undefined);
      
      console.log('✅ Réponse ChatService reçue:', response);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.reply,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('❌ Erreur ChatService:', error);
      
      // Message d'erreur utilisateur-friendly
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "❌ Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?\n\n💡 **Suggestions** :\n• Vérifiez votre connexion internet\n• Réessayez dans quelques secondes\n• Utilisez des mots-clés simples",
        timestamp: new Date(),
        suggestions: ["Réessayer", "Analyser un produit", "Conseils nutrition", "Retour à l'accueil"]
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ Gestion suggestions prédéfinies
  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping) return;
    handleSendMessage(suggestion);
  };

  // ✅ Gestion navigation
  const handleBack = () => {
    if (context) {
      navigate('/search'); // Retour vers recherche si contexte analyse
    } else {
      navigate('/'); // Retour accueil sinon
    }
  };

  const handleSearchProducts = () => {
    navigate('/search');
  };

  const handleAnalyzeProduct = () => {
    navigate('/analyze');
  };

  // ✅ NOUVEAU: Reset chat
  const handleResetChat = () => {
    chatService.clearHistory();
    setMessages([]);
    setContext(null);
    
    // Nouveau message de bienvenue
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: "🔄 Chat réinitialisé ! Je suis votre assistant nutritionnel ECOLOJIA.\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
      suggestions: chatService.getSuggestedQuestions()
    };
    
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-green-500" />
              Assistant Nutritionnel
              {context && (
                <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  NOVA {context.novaGroup}
                </span>
              )}
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={handleResetChat}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Nouveau chat"
              >
                🔄
              </button>
              <button
                onClick={handleSearchProducts}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Rechercher des produits"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={handleAnalyzeProduct}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Analyser un produit"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
          
          {/* ✅ NOUVEAU: Contexte produit affiché si disponible */}
          {context && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">📦 Produit analysé</h3>
                  <p className="text-sm text-green-700">{context.productName}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                    <span>NOVA {context.novaGroup}</span>
                    <span>Score: {context.healthScore}/100</span>
                    {context.additives && (
                      <span>{context.additives.length} additif(s)</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setContext(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
                  message.type === 'user' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white border border-gray-200'
                } rounded-lg px-4 py-3 shadow-sm`}>
                  
                  {/* Avatar et nom */}
                  <div className="flex items-center mb-2">
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 mr-2" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2 text-green-500" />
                    )}
                    <span className="text-xs font-medium">
                      {message.type === 'user' ? 'Vous' : 'Assistant IA'}
                    </span>
                  </div>

                  {/* Contenu du message */}
                  <div className={`text-sm leading-relaxed ${
                    message.type === 'user' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.content.split('\n').map((line, index) => (
                      <div key={index} className={index > 0 ? 'mt-2' : ''}>
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isTyping}
                          className="block w-full text-left text-xs bg-green-50 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-500 text-green-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-gray-400'
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
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">Assistant IA</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">En train d'écrire...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions suggérées (si aucun message utilisateur) */}
          {messages.filter(m => m.type === 'user').length === 0 && !isTyping && (
            <div className="mt-6 mb-4">
              <p className="text-sm text-gray-600 mb-3 text-center">💡 Questions fréquentes :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.slice(0, 6).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    disabled={isTyping}
                    className="text-left text-sm bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 border border-gray-200 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Appuyez sur Entrée pour envoyer • L'IA se base sur ChatService + API backend + fallback intelligent
            </p>
            
            {/* ✅ NOUVEAU: Status du service */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                🤖 ChatService v2.0 • Messages: {messages.length}
              </span>
              {context && (
                <span className="text-green-600">
                  📦 Contexte: {context.productName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
// EOF