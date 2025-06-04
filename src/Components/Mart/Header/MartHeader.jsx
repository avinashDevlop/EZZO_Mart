import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringCart, setIsHoveringCart] = useState(false);

  const navigationItems = [
  { name: 'Ready-Mix Concrete', icon: '🛣️' },
  { name: 'Cement', icon: '🏗️' },
  { name: 'Bricks', icon: '🧱' },
  { name: 'Tiles', icon: '⬜' },
  { name: 'Steel', icon: '⚡' },
  { name: 'Tools', icon: '🔧' },
  { name: 'Paint', icon: '🎨' },
  { name: 'Electrical', icon: '💡' },
  { name: 'Plumbing', icon: '🚿' },
  { name: 'Furniture', icon: '🪑' }
];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Add search logic here
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 shadow-xl' 
          : 'bg-gradient-to-r from-red-900 via-red-800 to-red-900 shadow-md'
      }`}>
        {/* Main Header */}
        <div className="relative px-5">
          <div className="flex items-center justify-between h-[55px]">
            {/* Logo with enhanced animation */}
            <div className="flex-shrink-0 group">
              <div className="relative">
         <h1 className="flex items-center text-white font-bold tracking-wide transform transition-all duration-300 group-hover:scale-[1.02] cursor-pointer">
  <span className="flex items-center space-x-2">
    <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 text-transparent bg-clip-text">
      EZZO
    </span>
    <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent font-bold text-2xl">
      Mart
    </span>
  </span>
  <Sparkles className="ml-2 h-5 w-5 text-yellow-300 animate-pulse group-hover:animate-spin group-hover:duration-1000" />
</h1>

                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>

            {/* Desktop Search with floating effect */}
            <div className="hidden md:flex flex-1 max-w-lg mx-5">
              <div className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur opacity-20 group-hover:opacity-30 transition-all duration-500 ease-in-out"></div>
                <div className="relative flex bg-white/95 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-[15px] text-gray-700 bg-transparent border-0 rounded-l-lg focus:outline-none placeholder-gray-500 focus:placeholder-gray-400 transition-all duration-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2.5 rounded-r-lg transition-all duration-300 flex items-center justify-center hover:shadow-inner hover:shadow-purple-500/20"
                  >
                    <Search className="h-[18px] w-[18px] text-white transform transition-transform duration-300 hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Navigation with bounce effect */}
            <div className="hidden md:flex items-center space-x-7">
              <button className="text-white hover:text-yellow-200 transition-all duration-300 text-[15px] relative group">
                VENDORS
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button className="text-white hover:text-yellow-200 transition-all duration-300 text-[15px] relative group">
                ABOUT US
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button 
                className="text-white hover:text-yellow-200 relative group"
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <div className="relative transform transition-transform duration-300 hover:scale-110">
                  <ShoppingCart className="h-[22px] w-[22px] transition-all duration-300" />
                  <span className={`absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold transition-all duration-300 ${
                    isHoveringCart ? 'animate-bounce' : ''
                  }`}>
                    3
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile Icons with spring effect */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleSearch}
                className="text-white hover:text-yellow-200 transition-all duration-300 transform hover:scale-110"
              >
                {isSearchOpen ? (
                  <X className="h-[22px] w-[22px] animate-spin-once" />
                ) : (
                  <Search className="h-[22px] w-[22px] hover:animate-pulse" />
                )}
              </button>
              <button 
                className="text-white hover:text-yellow-200 relative transform hover:scale-110 transition-all duration-300"
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <ShoppingCart className="h-[22px] w-[22px]" />
                <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold ${
                  isHoveringCart ? 'animate-ping-once' : ''
                }`}>
                  3
                </span>
              </button>
              <button
                onClick={toggleMenu}
                className="text-white hover:text-yellow-200 transition-all duration-300 transform hover:scale-110"
              >
                {isMenuOpen ? (
                  <X className="h-[22px] w-[22px] animate-spin-once" />
                ) : (
                  <Menu className="h-[22px] w-[22px] hover:animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search with slide-down effect */}
        <div className={`md:hidden bg-red-800 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
          isSearchOpen ? 'max-h-[68px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-2.5">
            <div className="flex bg-white/90 backdrop-blur-sm rounded-md shadow-inner">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-[15px] text-gray-700 bg-transparent rounded-l-md focus:outline-none placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                autoFocus={isSearchOpen}
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 rounded-r-md flex items-center justify-center transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600"
              >
                <Search className="h-[18px] w-[18px] text-white transform transition-transform duration-300 hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Menu with wave effect */}
        <div className="hidden md:block bg-gradient-to-r from-red-900 to-red-800 border-t border-red-700/30">
          <div className="px-5">
            <div className="flex justify-center">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  className="text-white hover:text-yellow-200 hover:bg-red-800/40 px-4 py-2.5 text-[13px] font-medium transition-all duration-300 border-r border-red-700/20 last:border-r-0 relative group overflow-hidden"
                >
                  <span className="flex items-center space-x-1.5 relative z-10">
                    <span className="text-[19px] transform transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu with slide-up effect */}
        <div className={`md:hidden bg-gradient-to-b from-red-800 to-red-900 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className="block w-full text-left text-white hover:bg-red-700/40 px-4 py-3 rounded-md text-[15px] transition-all duration-300 flex items-center space-x-3 hover:pl-5 transform hover:scale-[1.02]"
              >
                <span className="text-[18px] transform transition-transform duration-300 group-hover:scale-125">{item.icon}</span>
                <span>{item.name}</span>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
              </button>
            ))}
            <button className="block w-full text-left text-white hover:bg-red-700/40 px-4 py-3 rounded-md text-[15px] transition-all duration-300 flex items-center space-x-3 hover:pl-5 transform hover:scale-[1.02]">
              <span className="text-[18px]">🏪</span>
              <span>VENDORS</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
            <button className="block w-full text-left text-white hover:bg-red-700/40 px-4 py-3 rounded-md text-[15px] transition-all duration-300 flex items-center space-x-3 hover:pl-5 transform hover:scale-[1.02]">
              <span className="text-[18px]">ℹ️</span>
              <span>ABOUT US</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Spacer */}
      <div className="h-[55px] md:h-[92px]"></div>

      {/* Add custom animation keyframes to your global CSS */}
      <style jsx global>{`
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-spin-once {
          animation: spin-once 0.5s ease-out;
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;