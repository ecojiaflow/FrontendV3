// PATH: frontend/ecolojiaFrontV3/src/components/Navbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Leaf, Search, ShoppingBag, BookOpen, Home, Info, 
  BarChart3, ChevronDown, Apple, Sparkles, Camera, Package,
  TrendingUp, Clock, ArrowRight
} from 'lucide-react';

// ✅ NOUVEAU : Interface pour suggestions simplifiée
interface SearchSuggestion {
  query: string;
  type?: 'product' | 'brand' | 'category' | 'ingredient';
  icon?: string;
  category?: string;
}

// ✅ NOUVEAU : Service de recherche simplifié intégré
class SimpleSearchService {
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Suggestions populaires par défaut
    const popular = [
      { query: 'nutella bio', icon: '🍫', category: 'Alimentaire' },
      { query: 'shampoing sans sulfate', icon: '🧴', category: 'Cosmétiques' },
      { query: 'lessive écologique', icon: '🧽', category: 'Détergents' },
      { query: 'yaourt sans additifs', icon: '🥛', category: 'Alimentaire' }
    ];

    if (!query.trim()) {
      return popular;
    }

    // Filtrage simple basé sur la query
    return popular.filter(p => 
      p.query.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Instance du service
const searchService = new SimpleSearchService();

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
  // ========== STATE ==========
  const [isOpen, setIsOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // ========== REFS ==========
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();

  // ========== EFFECTS ==========
  
  useEffect(() => {
    // Fermer dropdown si click extérieur
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Raccourci clavier Ctrl+K pour focus recherche
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ========== SEARCH HANDLERS ==========

  const handleSearchChange = async (query: string) => {
    setQuickSearchQuery(query);

    // Clear timeout précédent
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // Délai pour éviter trop de requêtes
    suggestionTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      try {
        const newSuggestions = await searchService.getSuggestions(query);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Erreur suggestions navbar:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(quickSearchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuickSearchQuery(suggestion.query);
    setShowSearchDropdown(false);
    navigate(`/search?q=${encodeURIComponent(suggestion.query)}`);
  };

  const handleSearchFocus = async () => {
    setShowSearchDropdown(true);
    // Charger suggestions populaires si pas de query
    if (!quickSearchQuery.trim()) {
      try {
        const popularSuggestions = await searchService.getSuggestions('');
        setSuggestions(popularSuggestions);
      } catch (error) {
        console.error('Erreur chargement suggestions populaires:', error);
      }
    }
  };

  // ========== SUGGESTIONS RAPIDES ==========
  
  const popularSuggestions = [
    { query: 'nutella bio', icon: '🍫', category: 'Alimentaire' },
    { query: 'shampoing sans sulfate', icon: '🧴', category: 'Cosmétiques' },
    { query: 'lessive écologique', icon: '🧽', category: 'Détergents' },
    { query: 'yaourt sans additifs', icon: '🥛', category: 'Alimentaire' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ===== LOGO ===== */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <Leaf className="h-8 w-8 text-green-600 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-gray-800">ECOLOJIA</span>
            </Link>
          </div>

          {/* ===== RECHERCHE CENTRALE ===== */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                
                <input
                  ref={searchInputRef}
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={handleSearchFocus}
                  placeholder="🔍 Rechercher un produit... (nutella, shampoing bio)"
                  className="w-full pl-11 pr-20 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all placeholder-gray-500"
                />
                
                {/* Badge Multi-sources */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Multi-sources
                  </span>
                  
                  {/* Raccourci clavier */}
                  <div className="hidden md:flex items-center space-x-1 text-xs text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">K</kbd>
                  </div>
                </div>
              </div>
            </form>

            {/* DROPDOWN SUGGESTIONS */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                
                {/* Header dropdown */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {quickSearchQuery ? 'Suggestions' : 'Recherches populaires'}
                    </span>
                    <span className="text-xs text-gray-500">
                      2M+ produits • 3 catégories
                    </span>
                  </div>
                </div>

                {/* Loading */}
                {isLoadingSuggestions && (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                  </div>
                )}

                {/* Suggestions dynamiques */}
                {!isLoadingSuggestions && suggestions.length > 0 && (
                  <div className="py-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                          {suggestion.icon ? (
                            <span className="text-lg">{suggestion.icon}</span>
                          ) : (
                            <Search className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{suggestion.query}</div>
                          {suggestion.type && (
                            <div className="text-xs text-gray-500 capitalize">
                              {suggestion.type === 'product' ? 'Produit' : 
                               suggestion.type === 'brand' ? 'Marque' : 
                               suggestion.type === 'category' ? 'Catégorie' : 'Ingrédient'}
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggestions populaires par défaut */}
                {!isLoadingSuggestions && suggestions.length === 0 && !quickSearchQuery && (
                  <div className="py-2">
                    {popularSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors">
                          <span className="text-lg">{suggestion.icon}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{suggestion.query}</div>
                          <div className="text-xs text-gray-500">{suggestion.category}</div>
                        </div>
                        
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer dropdown */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Appuyez <kbd className="px-1 bg-gray-200 rounded">Entrée</kbd> pour rechercher</span>
                    <span>ou <kbd className="px-1 bg-gray-200 rounded">Échap</kbd> pour fermer</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== MENU DESKTOP ===== */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/scan" 
              className="flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors group"
            >
              <Camera className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Scanner
            </Link>
            
            <Link 
              to="/multi-scan" 
              className="flex items-center text-gray-600 hover:text-purple-600 font-medium transition-colors group"
            >
              <Sparkles className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Multi-Produits
            </Link>
            
            <Link 
              to="/dashboard" 
              className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors group"
            >
              <BarChart3 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Dashboard
            </Link>

            {/* Dropdown À propos */}
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors">
                À propos
                <ChevronDown className="h-4 w-4 ml-1 group-hover:rotate-180 transition-transform" />
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link to="/about" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
                  🌱 Notre mission
                </Link>
                <Link to="/blog" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
                  📚 Blog
                </Link>
                <Link to="/contact" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
                  📧 Contact
                </Link>
              </div>
            </div>
          </div>

          {/* ===== BOUTON MENU MOBILE ===== */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ===== MENU MOBILE ===== */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link 
                to="/" 
                className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4 mr-3" />
                Accueil
              </Link>
              
              <Link 
                to="/search" 
                className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Search className="h-4 w-4 mr-3" />
                Rechercher
              </Link>
              
              <Link 
                to="/scan" 
                className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Camera className="h-4 w-4 mr-3" />
                Scanner
              </Link>
              
              <Link 
                to="/multi-scan" 
                className="flex items-center px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <Sparkles className="h-4 w-4 mr-3" />
                Multi-Produits
              </Link>
              
              <Link 
                to="/dashboard" 
                className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Dashboard
              </Link>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link 
                  to="/about" 
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <Info className="h-4 w-4 mr-3" />
                  À propos
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;