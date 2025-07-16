import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { Search, ShoppingCart, Menu, X, MapPin, User, LogOut, LogIn, ChevronDown } from "lucide-react";

import CementIcon from "../../../pages/Mart/images/cement.png";
import BricksIcon from "../../../pages/Mart/images/bricks.png";
import TilesIcon from "../../../pages/Mart/images/tiles.png";
import SteelIcon from "../../../pages/Mart/images/steel.png";
import PaintIcon from "../../../pages/Mart/images/Paint.png";
import ToolsIcon from "../../../pages/Mart/images/tools.png";
import ElectricalIcon from "../../../pages/Mart/images/electrical.png";
import FurnitureIcon from "../../../pages/Mart/images/furniture.png";
import ReadyMixIcon from "../../../pages/Mart/images/mixTruck.png";
import PlumbingIcon from "../../../pages/Mart/images/plumbing.png";

const Header = ({ toggleCart }) => {
  const navigate = useNavigate();

  // State variables
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringCart, setIsHoveringCart] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const [userLocation, setUserLocation] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    coordinates: null
  });
  const [cartItemCount, setCartItemCount] = useState(0);

  const navigationItems = [
    { name: "Ready-Mix Concrete", value: "ready-mix-concrete", icon: ReadyMixIcon },
    { name: "Cement", value: "cement", icon: CementIcon },
    { name: "Bricks", value: "bricks", icon: BricksIcon },
    { name: "Tiles", value: "tiles", icon: TilesIcon },
    { name: "Steel", value: "steel", icon: SteelIcon },
    { name: "Tools", value: "tools", icon: ToolsIcon },
    { name: "Paint", value: "paint", icon: PaintIcon },
    { name: "Electrical", value: "electrical", icon: ElectricalIcon },
    { name: "Plumbing", value: "plumbing", icon: PlumbingIcon },
    { name: "Furniture", value: "furniture", icon: FurnitureIcon },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const loadLocation = () => {
      const locationData = JSON.parse(localStorage.getItem('customerLocation') || '{}');
      if (locationData && (locationData.city || locationData.pincode)) {
        setUserLocation(locationData);
      }
    };

    const loadCartItems = () => {
      const userId = localStorage.getItem('customerId');
      if (userId) {
        const db = getDatabase();
        const cartRef = ref(db, `Users/${userId}/Cart`);

        onValue(cartRef, (snapshot) => {
          const cartData = snapshot.val();
          setCartItemCount(cartData ? Object.keys(cartData).length : 0);
        });

        return () => off(cartRef);
      }
    };

    const checkAuthStatus = () => {
      const custData = localStorage.getItem('customerData');
      if (custData) {
        try {
          const parsedData = JSON.parse(custData);
          setIsLoggedIn(true);
          setUserName(parsedData.fullName || 'User');
        } catch (err) {
          console.error('Error parsing customer data:', err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    loadLocation();
    loadCartItems();
    checkAuthStatus();

    const handleCartUpdate = () => loadCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false);
    setIsProfileOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerLocation');
    localStorage.removeItem('customerData');
    localStorage.removeItem('customerEmail');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    navigate('/mart-login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLocationClick = () => {
    console.log("Location change requested");
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products-categorie/${categoryValue}`);
    setTimeout(() => {
      window.location.reload();
    }, 100);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-lg"
          : "bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-500 shadow-md"
      }`}>
        <div className="relative px-4 sm:px-5">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            {/* Logo */}
            <div
              className="flex-shrink-0 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="text-center group">
                  <div className="inline-flex flex-col items-center justify-center leading-none transform transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
                        EZZO
                      </span>
                      <span className="text-white font-bold text-base sm:text-lg self-end hover:text-amber-100 transition-colors duration-300">
                        Mart
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm text-amber-100 italic tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300">
                      into sustainability
                    </span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>

            {/* Desktop Location */}
            <div className="hidden sm:flex items-center mx-2 md:mx-4 relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center text-white hover:text-amber-100 transition-colors duration-300 group"
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 group-hover:animate-bounce" />
                <div className="text-left max-w-[120px] sm:max-w-[160px] md:max-w-[180px]">
                  <div className="text-[10px] sm:text-xs text-amber-100 group-hover:text-white truncate">
                    Deliver to
                  </div>
                  <div className="text-xs sm:text-sm font-medium truncate">
                    {userLocation.city
                      ? `${userLocation.city}, ${userLocation.state || ''}`
                      : 'Select Location'}
                  </div>
                </div>
              </button>

              {showLocationTooltip && userLocation.address && (
                <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 bg-white shadow-lg rounded-md p-2 sm:p-3 z-50 border border-amber-100 animate-fade-in">
                  <div className="text-xs sm:text-sm font-medium text-gray-800">
                    Delivery Address
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                    {userLocation.address}
                  </div>
                  <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-amber-100 text-[10px] sm:text-xs text-amber-600">
                    Click to change location
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Location */}
            <div className="flex sm:hidden items-center mx-1 relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center text-white hover:text-amber-100 transition-colors duration-300 group"
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
              >
                <MapPin className="h-4 w-4 mr-0.5 group-hover:animate-bounce" />
                <div className="text-left max-w-[80px] truncate">
                  <div className="text-[9px] text-amber-100 group-hover:text-white truncate">
                    Deliver to
                  </div>
                  <div className="text-[10px] font-medium truncate">
                    {userLocation.city
                      ? `${userLocation.city}`
                      : 'Location'}
                  </div>
                </div>
              </button>

              {showLocationTooltip && userLocation.address && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-md p-2 z-50 border border-amber-100 animate-fade-in">
                  <div className="text-[10px] font-medium text-gray-800">
                    Delivery Address
                  </div>
                  <div className="text-[9px] text-gray-600 mt-0.5">
                    {userLocation.address}
                  </div>
                  <div className="mt-1 pt-1 border-t border-amber-100 text-[9px] text-amber-600">
                    Tap to change location
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-3 lg:mx-5">
              <div className="relative w-full group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 blur opacity-20 group-hover:opacity-40 transition-all duration-500 ease-in-out"></div>
                <div className="relative flex bg-white/95 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-amber-200/30 group-focus-within:border-amber-300 group-focus-within:shadow-lg">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 text-[14px] md:text-[15px] text-gray-800 bg-transparent border-0 rounded-l-lg focus:outline-none placeholder-amber-600/70 focus:placeholder-amber-500/70 transition-colors duration-300"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 px-4 py-2 rounded-r-lg transition-all duration-300 flex items-center justify-center hover:shadow-inner hover:shadow-amber-400/20 active:scale-95"
                  >
                    <Search className="h-4 w-4 md:h-[18px] md:w-[18px] text-white transform transition-transform duration-300 hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-7">
              <button
                onClick={() => navigate('/vendor-login')}
                className="text-white hover:text-amber-100 transition-all duration-300 text-[14px] lg:text-[15px] relative group"
              >
                VENDORS
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center text-white hover:text-amber-100 transition-colors duration-300"
                >
                  <User className="h-5 w-5 lg:h-6 lg:w-6" />
                  {isLoggedIn && (
                    <span className="ml-1 lg:ml-2 flex items-center space-x-1">
                      <span className="text-[14px] lg:text-[15px]">{userName}</span>
                      <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                    </span>
                  )}
                </button>

                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-amber-100"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">Hello, {userName}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/mart-login');
                          }} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate('/mart-orders');
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                        >
                          My Orders
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate('/mart-login');
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 flex items-center"
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login / Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                className="text-white hover:text-amber-100 relative group"
                onClick={toggleCart}
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <div className="relative transform transition-transform duration-300 hover:scale-110">
                  <ShoppingCart className="h-5 w-5 lg:h-[22px] lg:w-[22px] transition-all duration-300 group-hover:rotate-[15deg]" />
                  {cartItemCount > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] rounded-full h-[16px] w-[16px] lg:h-[18px] lg:w-[18px] flex items-center justify-center font-bold transition-all duration-300 ${
                        isHoveringCart ? "animate-bounce" : ""
                      }`}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-3 sm:space-x-4">
              <button
                onClick={toggleSearch}
                className="text-white hover:text-amber-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                {isSearchOpen ? (
                  <X className="h-5 w-5 animate-spin-once" />
                ) : (
                  <Search className="h-5 w-5 hover:animate-pulse" />
                )}
              </button>
              <button
                className="text-white hover:text-amber-100 relative transform hover:scale-110 transition-all duration-300 active:scale-95"
                onClick={toggleCart}
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <ShoppingCart className="h-5 w-5 hover:rotate-[15deg] transition-transform duration-300" />
                {cartItemCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] rounded-full h-[16px] w-[16px] flex items-center justify-center font-bold ${
                      isHoveringCart ? "animate-ping-once" : ""
                    }`}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="text-white hover:text-amber-100 transition-all duration-300"
                >
                  <User className="h-5 w-5" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-amber-100">
                    {isLoggedIn ? (
                      <>
                        <div className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                          <div className="font-medium">Hello, {userName}</div>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/mart-login');
                          }} 
                          className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate('/mart-orders');
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50"
                        >
                          Your Orders
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50 flex items-center"
                        >
                          <LogOut className="h-3 w-3 mr-2" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate('/mart-login');
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50 flex items-center"
                        >
                          <LogIn className="h-3 w-3 mr-2" />
                          Login
                        </button>
                        <button
                          onClick={() => {
                            navigate('/mart-signup');
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50"
                        >
                          Create Account
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={toggleMenu}
                className="text-white hover:text-amber-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 animate-spin-once" />
                ) : (
                  <Menu className="h-5 w-5 hover:animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
            isSearchOpen ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 py-2.5">
            <div className="flex bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-amber-200/30 focus-within:border-amber-300 focus-within:shadow-md transition-all duration-300">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-gray-800 bg-transparent rounded-l-md focus:outline-none placeholder-amber-600/70 focus:placeholder-amber-500/70 transition-colors duration-300"
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                autoFocus={isSearchOpen}
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-2 rounded-r-md flex items-center justify-center transition-all duration-300 hover:from-amber-600 hover:to-amber-500 hover:shadow-inner hover:shadow-amber-400/20 active:scale-95"
              >
                <Search className="h-4 w-4 text-white transform transition-transform duration-300 hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Categories */}
        <div className="hidden md:block bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 shadow-sm border-t border-amber-600/30 relative">
          <div className="px-4 lg:px-5 py-2">
            <div className="flex justify-center overflow-x-auto no-scrollbar relative">
              {navigationItems.map((item, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <button
                    onClick={() => handleCategoryClick(item.value)}
                    className="text-white hover:text-amber-100 hover:bg-amber-700/40 px-3 lg:px-5 py-1.5 text-xs sm:text-[13px] font-medium transition-all duration-300 border-r border-amber-600/20 last:border-r-0 relative group overflow-hidden flex items-center"
                  >
                    <span className="flex items-center space-x-1.5 sm:space-x-2 relative z-10">
                      <span className="text-[16px] sm:text-[18px] transform transition-transform duration-300 group-hover:scale-125">
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="h-4 w-4 sm:h-5 sm:w-5 object-contain"
                        />
                      </span>
                      <span>{item.name}</span>
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-3 py-2 space-y-1">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleCategoryClick(item.value)}
                  className="block w-full text-left text-white hover:bg-amber-600/40 px-3 py-2.5 rounded-md text-sm transition-all duration-300 flex items-center justify-between transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[18px]">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="h-5 w-5 object-contain"
                      />
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </button>
              </div>
            ))}
            <button
              onClick={() => navigate('/vendor-login')}
              className="block w-full text-left text-white hover:bg-amber-600/40 px-3 py-2.5 rounded-md text-sm transition-all duration-300 flex items-center space-x-3 hover:pl-4 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-[18px]">🏪</span>
              <span>VENDORS</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button
              onClick={() => navigate('/mart-orders')}
              className="block w-full text-left text-white hover:bg-amber-600/40 px-3 py-2.5 rounded-md text-sm transition-all duration-300 flex items-center space-x-3 hover:pl-4 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-[18px]">📦</span>
              <span>ORDERS</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button
              onClick={() => navigate('/mart-login')}
              className="block w-full text-left text-white hover:bg-amber-600/40 px-3 py-2.5 rounded-md text-sm transition-all duration-300 flex items-center space-x-3 hover:pl-4 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <User className="h-5 w-5" />
              <span>PROFILE</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button className="block w-full text-left text-white hover:bg-amber-600/40 px-3 py-2.5 rounded-md text-sm transition-all duration-300 flex items-center space-x-3 hover:pl-4 transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-[18px]">ℹ️</span>
              <span>ABOUT US</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for header height */}
      <div className="h-16 md:h-[100px]"></div>

      <style jsx global>{`
        @keyframes spin-once {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes ping-once {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-spin-once {
          animation: spin-once 0.5s ease-out;
        }
        .animate-ping-once {
          animation: ping-once 0.5s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .transition-slow {
          transition: all 0.5s ease;
        }
        .transition-medium {
          transition: all 0.3s ease;
        }
        .transition-fast {
          transition: all 0.15s ease;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Header;