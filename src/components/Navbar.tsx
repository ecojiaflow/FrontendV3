import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Leaf, Search, ShoppingBag, BookOpen, Home, Info, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Leaf className="h-8 w-8 text-eco-leaf" />
          <span className="ml-2 text-2xl font-semibold text-eco-text tracking-wider">ECOLOJIA</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" icon={<Home size={18} />} label={t('common.home')} />
          <NavLink to="/" icon={<ShoppingBag size={18} />} label={t('common.products')} />
          <NavLink to="/" icon={<Search size={18} />} label={t('common.categories')} />
          <NavLink to="/stats" icon={<BarChart3 size={18} />} label="Stats" />
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
          <MobileNavLink to="/" label={t('common.home')} />
          <MobileNavLink to="/" label={t('common.products')} />
          <MobileNavLink to="/" label={t('common.categories')} />
          <MobileNavLink to="/stats" label="Stats" />
          <MobileNavLink to="/about" label={t('common.about')} />
          <MobileNavLink to="#" label={t('common.blog')} />
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

const MobileNavLink: React.FC<NavLinkProps> = ({ to, label }) => {
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
    >
      {label}
    </Link>
  );
};

export default Navbar;