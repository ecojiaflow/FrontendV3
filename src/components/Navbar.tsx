// PATH: frontend/ecolojiaFrontV3/src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Leaf, Search, ShoppingBag, BookOpen, Home, Info, BarChart3, ChevronDown, Apple, Sparkles, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);

  return (
    <nav className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Leaf className="h-8 w-8 text-eco-leaf" />
          <span className="ml-2 text-2xl font-semibold text-eco-text tracking-wider">ECOLOJIA</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" icon={<Home size={18} />} label={t('common.home')} />
          
          {/* 🚀 NOUVEAU: Menu dropdown Produits multi-catégories */}
          <div className="relative">
            <button
              onClick={() => setShowProductsMenu(!showProductsMenu)}
              className="flex items-center space-x-1 text-eco-text hover:text-eco-leaf font-medium transition-colors"
              onBlur={() => setTimeout(() => setShowProductsMenu(false), 150)}
            >
              <ShoppingBag size={18} />
              <span>{t('common.products')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProductsMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showProductsMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-3">Analyses par catégorie</div>
                  
                  {/* Alimentaire */}
                  <Link
                    to="/scan"
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                    onClick={() => setShowProductsMenu(false)}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Apple className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Alimentaire</div>
                      <div className="text-sm text-gray-600">Classification NOVA & ultra-transformation</div>
                    </div>
                  </Link>
                  
                  {/* Cosmétiques */}
                  <Link
                    to="/multi-scan?category=cosmetics"
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors group"
                    onClick={() => setShowProductsMenu(false)}
                  >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        Cosmétiques
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">NOUVEAU</span>
                      </div>
                      <div className="text-sm text-gray-600">Perturbateurs endocriniens & allergènes</div>
                    </div>
                  </Link>
                  
                  {/* Détergents */}
                  <Link
                    to="/multi-scan?category=detergents"
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                    onClick={() => setShowProductsMenu(false)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        Détergents
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">NOUVEAU</span>
                      </div>
                      <div className="text-sm text-gray-600">Impact environnemental & toxicité</div>
                    </div>
                  </Link>

                  {/* CTA Multi-Scan */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link
                      to="/multi-scan"
                      className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                      onClick={() => setShowProductsMenu(false)}
                    >
                      <span className="font-medium">Analyse Multi-Produits</span>
                      <span className="text-xl">✨</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <NavLink to="/search" icon={<Search size={18} />} label={t('common.categories')} />
          <NavLink to="/dashboard" icon={<BarChart3 size={18} />} label="Dashboard" />
          <NavLink to="/about" icon={<Info size={18} />} label={t('common.about')} />
          <NavLink to="#" icon={<BookOpen size={18} />} label={t('common.blog')} />
          <LanguageSelector />
        </div>
        
        <button 
          className="md:hidden text-eco-text"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white mt-4 py-2 px-6 space-y-4">
          <MobileNavLink to="/" label={t('common.home')} onClick={() => setIsMenuOpen(false)} />
          
          {/* Menu mobile multi-produits */}
          <div className="space-y-2">
            <div className="font-medium text-gray-700 text-sm">Produits :</div>
            <MobileNavLink to="/scan" label="📱 Alimentaire" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/multi-scan?category=cosmetics" label="✨ Cosmétiques" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/multi-scan?category=detergents" label="💧 Détergents" onClick={() => setIsMenuOpen(false)} />
            <MobileNavLink to="/multi-scan" label="🚀 Multi-Produits" onClick={() => setIsMenuOpen(false)} />
          </div>
          
          <MobileNavLink to="/search" label={t('common.categories')} onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink to="/dashboard" label="Dashboard" onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink to="/about" label={t('common.about')} onClick={() => setIsMenuOpen(false)} />
          <MobileNavLink to="#" label={t('common.blog')} onClick={() => setIsMenuOpen(false)} />
          <div className="pt-2">
            <LanguageSelector />
          </div>
        </div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label }) => {
  if (to === '#') {
    return (
      <span className="flex items-center text-gray-400 cursor-not-allowed">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
    );
  }
  
  return (
    <Link 
      to={to}
      className="flex items-center hover:text-eco-leaf transition-colors text-eco-text"
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Link>
  );
};

interface MobileNavLinkProps {
  to: string;
  label: string;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, label, onClick }) => {
  if (to === '#') {
    return (
      <span className="block py-2 text-gray-400 cursor-not-allowed">
        {label}
      </span>
    );
  }
  
  return (
    <Link 
      to={to}
      className="block py-2 text-eco-text hover:text-eco-leaf transition-colors"
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navbar;