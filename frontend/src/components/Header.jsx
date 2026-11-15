import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ShoppingCart, Search, Menu, X, User, Sun, Moon, 
  ChevronDown, Phone, Tag, Info, Grid, Home as HomeIcon,
  Package, ShieldCheck, LogOut, LogIn, UserPlus, Sparkles
} from 'lucide-react';
import TopBar from './TopBar';
import { WhatsAppIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './SocialIcons';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api/axios';

const Header = () => {
  const { cartCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Dropdown states for Desktop
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isCategoriesMegaMenuOpen, setIsCategoriesMegaMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Mobile accordion state
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const productsRef = useRef(null);
  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch categories & settings once
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to load categories in header:', err));

    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to load settings in header:', err));
  }, []);

  // Track scroll for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsMobileSearchOpen(false);
    setIsProductsDropdownOpen(false);
    setIsCategoriesMegaMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productsRef.current && !productsRef.current.contains(e.target)) {
        setIsProductsDropdownOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setIsCategoriesMegaMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ q: val });
      if (window.location.pathname !== '/') navigate(`/?q=${val}`);
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
      if (window.location.pathname !== '/') navigate(`/`);
    }
  };

  const clearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
    if (window.location.pathname !== '/') navigate(`/`);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const whatsappNum = settings.whatsapp_number || settings.owner_aqib?.replace(/\D/g, '') || '923357727555';

  return (
    <>
      <header className={`bg-lightCard dark:bg-[#121212] border-b border-lightBorder dark:border-[#2a2a2a] sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? 'shadow-md dark:shadow-black/50' : ''
      }`}>
        {/* Floating Top Announcement Bar with Promotions & Social Links */}
        <TopBar />

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20 gap-2 md:gap-4">
            
            {/* Mobile: Hamburger Icon */}
            <div className="flex items-center gap-2 md:hidden">
              <button 
                onClick={() => setIsMobileDrawerOpen(true)}
                className="p-2 rounded-lg text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="text-xl md:text-2xl font-bold text-darkBlue dark:text-cyan flex items-center gap-2 group flex-shrink-0">
              <div 
                className="w-8 h-10 md:w-10 md:h-12 bg-darkBlue dark:bg-cyan transition-colors"
                style={{ 
                  WebkitMaskImage: 'url(/logo-alpha.png)', 
                  WebkitMaskSize: 'contain', 
                  WebkitMaskRepeat: 'no-repeat', 
                  WebkitMaskPosition: 'center',
                  maskImage: 'url(/logo-alpha.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center'
                }}
              ></div>
              <span className="font-extrabold tracking-tight">AJ<span className="text-lightBlue dark:text-aqua">Mart</span></span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-[14px] xl:text-[15px] font-semibold text-lightText dark:text-darkText">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' : 'hover:text-darkBlue dark:hover:text-cyan'
                }`}
              >
                Home
              </Link>

              {/* Products Dropdown */}
              <div className="relative" ref={productsRef}>
                <button 
                  onClick={() => {
                    setIsProductsDropdownOpen(!isProductsDropdownOpen);
                    setIsCategoriesMegaMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    isActive('/products') || isProductsDropdownOpen 
                      ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' 
                      : 'hover:text-darkBlue dark:hover:text-cyan'
                  }`}
                >
                  Products <ChevronDown size={15} className={`transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProductsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-lightCard dark:bg-[#1a1a1a] border border-lightBorder dark:border-[#333] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      to="/products"
                      onClick={() => setIsProductsDropdownOpen(false)}
                      className="block px-4 py-2 font-bold text-darkBlue dark:text-cyan hover:bg-lightBg dark:hover:bg-[#252525] border-b border-lightBorder dark:border-[#2a2a2a]"
                    >
                      All Products (All Items)
                    </Link>
                    <div className="max-h-80 overflow-y-auto py-1">
                      {categories.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.id}`}
                          onClick={() => setIsProductsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan hover:bg-lightBg dark:hover:bg-[#252525] transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Categories Mega Menu */}
              <div className="relative" ref={categoriesRef}>
                <button 
                  onClick={() => {
                    setIsCategoriesMegaMenuOpen(!isCategoriesMegaMenuOpen);
                    setIsProductsDropdownOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-colors ${
                    isActive('/categories') || isCategoriesMegaMenuOpen 
                      ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' 
                      : 'hover:text-darkBlue dark:hover:text-cyan'
                  }`}
                >
                  Categories <ChevronDown size={15} className={`transition-transform duration-200 ${isCategoriesMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoriesMegaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] xl:w-[840px] bg-lightCard dark:bg-[#1a1a1a] border border-lightBorder dark:border-[#333] rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-lightBorder dark:border-[#2a2a2a]">
                      <h4 className="font-bold text-base text-darkBlue dark:text-cyan">Shop by Category</h4>
                      <Link 
                        to="/categories" 
                        onClick={() => setIsCategoriesMegaMenuOpen(false)}
                        className="text-xs font-semibold text-lightBlue dark:text-aqua hover:underline"
                      >
                        View All Categories &rarr;
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {categories.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.id}`}
                          onClick={() => setIsCategoriesMegaMenuOpen(false)}
                          className="group flex flex-col items-center p-3 rounded-xl hover:bg-lightBg dark:hover:bg-[#252525] border border-transparent hover:border-lightBorder dark:hover:border-[#333] transition-all"
                        >
                          <div className="w-16 h-16 rounded-lg bg-lightBg dark:bg-[#0a0a0a] flex items-center justify-center p-1.5 mb-2 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                            {cat.image_url ? (
                              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain" />
                            ) : (
                              <Grid size={24} className="text-lightTextSecondary dark:text-darkTextSecondary" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-center text-lightText dark:text-darkText group-hover:text-darkBlue dark:group-hover:text-cyan line-clamp-1">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Offers */}
              <Link 
                to="/offers" 
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive('/offers') ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' : 'hover:text-darkBlue dark:hover:text-cyan'
                }`}
              >
                <Tag size={15} className="text-error-light dark:text-error-dark" /> Offers
              </Link>

              {/* About Us */}
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/about') ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' : 'hover:text-darkBlue dark:hover:text-cyan'
                }`}
              >
                About Us
              </Link>

              {/* Contact */}
              <Link 
                to="/contact" 
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/contact') ? 'text-darkBlue dark:text-cyan font-bold bg-darkBlue/5 dark:bg-cyan/10' : 'hover:text-darkBlue dark:hover:text-cyan'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-grow max-w-xs xl:max-w-sm relative">
              <input 
                type="text" 
                placeholder="Search grocery..." 
                value={query}
                onChange={handleSearchChange}
                className="input-field pl-9 pr-8 py-1.5 text-sm w-full rounded-full border-lightBorder dark:border-[#333]"
              />
              <Search className="absolute left-3 top-2.5 text-lightTextSecondary dark:text-darkTextSecondary" size={16} />
              {query && (
                <button onClick={clearSearch} className="absolute right-3 top-2.5 text-lightTextSecondary dark:text-darkTextSecondary hover:text-error-light dark:hover:text-error-dark">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Right Icons: Theme, Search (mobile), User, Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              
              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan hover:bg-lightBg dark:hover:bg-[#222] transition-colors" 
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </button>
              
              {/* User Account Menu */}
              <div className="hidden sm:flex items-center text-sm relative" ref={userMenuRef}>
                {user ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-lightBorder dark:border-[#333] hover:border-darkBlue dark:hover:border-cyan bg-lightBg/60 dark:bg-[#1a1a1a] transition-all font-semibold text-xs text-lightText dark:text-darkText shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-darkBlue dark:bg-cyan text-white dark:text-black flex items-center justify-center text-xs font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-lightCard dark:bg-[#181818] border border-lightBorder dark:border-[#333] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Profile Header */}
                        <div className="px-4 py-2 border-b border-lightBorder dark:border-[#2a2a2a]">
                          <div className="font-bold text-sm text-lightText dark:text-darkText truncate">{user.name}</div>
                          <div className="text-xs text-lightTextSecondary dark:text-darkTextSecondary truncate">{user.email}</div>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan">
                              {user.role === 'admin' ? (
                                <>
                                  <ShieldCheck size={11} />
                                  <span>Administrator</span>
                                </>
                              ) : (
                                <>
                                  <User size={11} />
                                  <span>Verified Customer</span>
                                </>
                              )}
                            </span>

                            {/* Customer Reward Points Display */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20" title="AJMart Customer Points">
                              <Sparkles size={11} />
                              <span>{user.points || 0} pts</span>
                            </span>
                          </div>
                        </div>

                        {/* Menu Actions */}
                        <div className="py-1 text-xs font-semibold">
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-lightText dark:text-darkText hover:bg-lightBg dark:hover:bg-[#252525] transition-colors"
                            >
                              <ShieldCheck size={15} className="text-darkBlue dark:text-cyan" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}

                          <Link
                            to="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-lightText dark:text-darkText hover:bg-lightBg dark:hover:bg-[#252525] transition-colors"
                          >
                            <Package size={15} className="text-darkBlue dark:text-cyan" />
                            <span>My Orders & History</span>
                          </Link>

                          <Link
                            to="/products"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-lightText dark:text-darkText hover:bg-lightBg dark:hover:bg-[#252525] transition-colors"
                          >
                            <Grid size={15} className="text-darkBlue dark:text-cyan" />
                            <span>Browse Wholesale Catalog</span>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="pt-1 border-t border-lightBorder dark:border-[#2a2a2a]">
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-colors text-left"
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 font-bold text-xs py-1.5 px-3 rounded-xl bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan hover:bg-darkBlue dark:hover:bg-cyan hover:text-white dark:hover:text-black transition-all"
                    >
                      <LogIn size={14} />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      className="hidden md:flex items-center gap-1 font-semibold text-xs py-1.5 px-2.5 text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan transition-colors"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Cart Icon with badge */}
              <Link to="/cart" className="relative p-2 text-lightText dark:text-darkText hover:text-darkBlue dark:hover:text-cyan transition-colors" aria-label="Shopping Cart">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-darkBlue dark:bg-cyan text-white dark:text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Link>

            </div>
          </div>

          {/* Mobile Search Input dropdown */}
          {isMobileSearchOpen && (
            <div className="md:hidden py-3 border-t border-lightBorder dark:border-[#2a2a2a] relative animate-in fade-in duration-150">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={query}
                onChange={handleSearchChange}
                className="input-field pl-10 pr-9 py-2 w-full text-sm rounded-lg"
                autoFocus
              />
              <Search className="absolute left-3 top-5 text-lightTextSecondary dark:text-darkTextSecondary" size={18} />
              {query && (
                <button onClick={clearSearch} className="absolute right-3 top-5 text-lightTextSecondary dark:text-darkTextSecondary hover:text-error-light dark:hover:text-error-dark">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileDrawerOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-lightCard dark:bg-[#161616] border-r border-lightBorder dark:border-[#2a2a2a] shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-lightBorder dark:border-[#2a2a2a] flex items-center justify-between">
              <Link to="/" onClick={() => setIsMobileDrawerOpen(false)} className="text-xl font-bold text-darkBlue dark:text-cyan flex items-center gap-2">
                <span>AJ<span className="text-lightBlue dark:text-aqua">Mart</span></span>
              </Link>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-semibold text-lightText dark:text-darkText">
              <Link 
                to="/" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive('/') ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <HomeIcon size={18} /> Home
              </Link>

              <Link 
                to="/products" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  location.pathname === '/products' ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <Grid size={18} /> All Products
              </Link>

              {/* Categories Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-lightBg dark:hover:bg-[#222] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Grid size={18} /> Categories
                  </span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMobileCategoriesOpen && (
                  <div className="pl-9 pr-2 py-1 space-y-1 text-sm font-medium">
                    <Link
                      to="/categories"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="block py-1.5 text-lightBlue dark:text-aqua font-semibold"
                    >
                      View All Categories &rarr;
                    </Link>
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.id}`}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="block py-1.5 text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/offers" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive('/offers') ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <Tag size={18} className="text-error-light dark:text-error-dark" /> Deals & Offers
              </Link>

              <Link 
                to="/about" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive('/about') ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <Info size={18} /> About Us
              </Link>

              <Link 
                to="/contact" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive('/contact') ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <Phone size={18} /> Contact & Store Info
              </Link>

              <Link 
                to="/faq" 
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive('/faq') ? 'bg-darkBlue/10 dark:bg-cyan/15 text-darkBlue dark:text-cyan font-bold' : 'hover:bg-lightBg dark:hover:bg-[#222]'
                }`}
              >
                <Info size={18} /> FAQs
              </Link>

              {/* Direct WhatsApp Action Link */}
              <a 
                href={`https://wa.me/${whatsappNum}?text=Hello%20AJMart,%20I%20want%20to%20order`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#25D366] hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold transition-colors"
              >
                <WhatsAppIcon size={18} /> WhatsApp Order
              </a>

              {/* WhatsApp Channel */}
              <a 
                href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-semibold transition-colors"
              >
                <WhatsAppIcon size={18} /> WhatsApp Channel
              </a>

              {/* Social Channels Row in Mobile Drawer */}
              <div className="pt-2 px-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-2">
                  Follow Us
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={settings.facebook_url || 'https://www.facebook.com/share/14uooa52BdR/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#222] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary hover:text-[#1877F2]"
                    title="Follow AJMart on Facebook"
                  >
                    <FacebookIcon size={15} />
                  </a>
                  <a
                    href={settings.instagram_url || 'https://www.instagram.com/aj_traders006'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#222] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary hover:text-[#E4405F]"
                    title="Follow AJMart on Instagram"
                  >
                    <InstagramIcon size={15} />
                  </a>
                  <a
                    href={settings.tiktok_url || 'https://www.tiktok.com/@aj.traders07'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-lightBg dark:bg-[#222] border border-lightBorder dark:border-[#333] flex items-center justify-center text-lightTextSecondary hover:text-black dark:hover:text-white"
                    title="Watch AJMart on TikTok"
                  >
                    <TikTokIcon size={15} />
                  </a>
                  <a
                    href={settings.whatsapp_channel_url || 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-full bg-lightBg dark:bg-[#222] border border-lightBorder dark:border-[#333] flex items-center gap-1 text-[11px] font-bold text-[#25D366]"
                    title="Join AJMart WhatsApp Channel"
                  >
                    <WhatsAppIcon size={14} />
                    <span>Channel</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer Account Area */}
            <div className="p-4 border-t border-lightBorder dark:border-[#2a2a2a] bg-lightBg/50 dark:bg-[#111]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-lightTextSecondary dark:text-darkTextSecondary">Signed in as:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Sparkles size={10} /> {user.points || 0} pts
                    </span>
                  </div>
                  <div className="font-bold text-darkBlue dark:text-cyan truncate">{user.name}</div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/orders'}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="btn-primary text-xs py-1.5 px-3 flex-1 text-center"
                    >
                      {user.role === 'admin' ? 'Admin Panel' : 'My Orders'}
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsMobileDrawerOpen(false); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-error-light/30 text-error-light dark:text-error-dark"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="btn-primary text-center text-sm py-2 flex-1"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="px-4 py-2 text-center text-sm font-semibold rounded-lg border border-lightBorder dark:border-[#333] hover:bg-lightBg dark:hover:bg-[#222] transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
