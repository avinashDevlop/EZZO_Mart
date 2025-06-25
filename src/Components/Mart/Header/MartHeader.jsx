import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { Search, ShoppingCart, Menu, X, MapPin } from "lucide-react";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringCart, setIsHoveringCart] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);
  // const [cartItems, setCartItems] = useState([]);

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
      if (cartData) {
        // Count the number of items in the cart
        const count = Object.keys(cartData).length;
        setCartItemCount(count);
      } else {
        setCartItemCount(0);
      }
    });
    
    // Return the unsubscribe function to clean up later
    return () => off(cartRef);
  }
};

    loadLocation();
    loadCartItems();

    // Listen for cart updates from other components
    const handleCartUpdate = () => loadCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
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
    console.log("Searching for:", searchQuery);
  };

  const handleLocationClick = () => {
    console.log("Location change requested");
  };

  const handleCategoryClick = (categoryValue) => {
    navigate(`/products-categorie/${categoryValue}`);
    setTimeout(() => {
      window.location.reload(); // Forces refresh after navigating
    }, 100); // Small delay ensures routing happens first
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${isScrolled
          ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-lg"
          : "bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-500 shadow-md"
          }`}
      >
        <div className="relative px-5">
          <div className="flex items-center justify-between h-[68px]">
            <div
              className="flex-shrink-0 group cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="text-center group">
                  <div className="inline-flex flex-col items-center justify-center leading-none transform transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
                        EZZO
                      </span>
                      <span className="text-white font-bold text-lg self-end hover:text-amber-100 transition-colors duration-300">
                        Mart
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-amber-100 italic tracking-wide opacity-90 hover:opacity-100 transition-opacity duration-300">
                      into sustainability
                    </span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>

            <div className="hidden md:flex items-center mx-4 relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center text-white hover:text-amber-100 transition-colors duration-300 group"
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
              >
                <MapPin className="h-5 w-5 mr-1.5 group-hover:animate-bounce" />
                <div className="text-left max-w-[180px]">
                  <div className="text-xs text-amber-100 group-hover:text-white truncate">
                    Deliver to
                  </div>
                  <div className="text-sm font-medium truncate">
                    {userLocation.city
                      ? `${userLocation.city}, ${userLocation.state || ''}`
                      : 'Select Location'}
                  </div>
                </div>
              </button>

              {showLocationTooltip && userLocation.address && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md p-3 z-50 border border-amber-100 animate-fade-in">
                  <div className="text-sm font-medium text-gray-800">
                    Delivery Address
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {userLocation.address}
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-100 text-xs text-amber-600">
                    Click to change location
                  </div>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center mx-2 relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center text-white hover:text-amber-100 transition-colors duration-300 group"
                onMouseEnter={() => setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
              >
                <MapPin className="h-5 w-5 mr-1.5 group-hover:animate-bounce" />
                <div className="text-left max-w-[140px] truncate">
                  <div className="text-[10px] text-amber-100 group-hover:text-white truncate">
                    Deliver to
                  </div>
                  <div className="text-xs font-medium truncate">
                    {userLocation.city
                      ? `${userLocation.city}, ${userLocation.state || ''}`
                      : 'Select Location'}
                  </div>
                </div>
              </button>

              {showLocationTooltip && userLocation.address && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md p-3 z-50 border border-amber-100 animate-fade-in">
                  <div className="text-xs font-medium text-gray-800">
                    Delivery Address
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    {userLocation.address}
                  </div>
                  <div className="mt-1 pt-1 border-t border-amber-100 text-[10px] text-amber-600">
                    Tap to change location
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex flex-1 max-w-lg mx-5">
              <div className="relative w-full group">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 blur opacity-20 group-hover:opacity-40 transition-all duration-500 ease-in-out"></div>
                <div className="relative flex bg-white/95 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-amber-200/30 group-focus-within:border-amber-300 group-focus-within:shadow-lg">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-[15px] text-gray-800 bg-transparent border-0 rounded-l-lg focus:outline-none placeholder-amber-600/70 focus:placeholder-amber-500/70 transition-colors duration-300"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 px-4 py-2.5 rounded-r-lg transition-all duration-300 flex items-center justify-center hover:shadow-inner hover:shadow-amber-400/20 active:scale-95"
                  >
                    <Search className="h-[18px] w-[18px] text-white transform transition-transform duration-300 hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-7">
              <button
                onClick={() => navigate('/vendor-login')}
                className="text-white hover:text-amber-100 transition-all duration-300 text-[15px] relative group"
              >
                VENDORS
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => navigate('/mart-orders')}
                className="text-white hover:text-amber-100 transition-all duration-300 text-[15px] relative group"
              >
                ORDERS
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => navigate('/mart-login')}
                className="text-white hover:text-amber-100 transition-all duration-300 text-[15px] relative group"
              >
                LOGIN
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button
                className="text-white hover:text-amber-100 relative group"
                onClick={toggleCart}
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <div className="relative transform transition-transform duration-300 hover:scale-110">
                  <ShoppingCart className="h-[22px] w-[22px] transition-all duration-300 group-hover:rotate-[15deg]" />
                  {cartItemCount > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold transition-all duration-300 ${isHoveringCart ? "animate-bounce" : ""
                        }`}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleSearch}
                className="text-white hover:text-amber-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                {isSearchOpen ? (
                  <X className="h-[22px] w-[22px] animate-spin-once" />
                ) : (
                  <Search className="h-[22px] w-[22px] hover:animate-pulse" />
                )}
              </button>
              <button
                className="text-white hover:text-amber-100 relative transform hover:scale-110 transition-all duration-300 active:scale-95"
                onClick={toggleCart}
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <ShoppingCart className="h-[22px] w-[22px] hover:rotate-[15deg] transition-transform duration-300" />
                {cartItemCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold ${isHoveringCart ? "animate-ping-once" : ""
                      }`}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={toggleMenu}
                className="text-white hover:text-amber-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
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

        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isSearchOpen ? "max-h-[68px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-4 py-2.5">
            <div className="flex bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-amber-200/30 focus-within:border-amber-300 focus-within:shadow-md transition-all duration-300">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-[15px] text-gray-800 bg-transparent rounded-l-md focus:outline-none placeholder-amber-600/70 focus:placeholder-amber-500/70 transition-colors duration-300"
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                autoFocus={isSearchOpen}
              />
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 rounded-r-md flex items-center justify-center transition-all duration-300 hover:from-amber-600 hover:to-amber-500 hover:shadow-inner hover:shadow-amber-400/20 active:scale-95"
              >
                <Search className="h-[18px] w-[18px] text-white transform transition-transform duration-300 hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 shadow-sm border-t border-amber-600/30 relative">
          <div className="px-5 py-2.5">
            <div className="flex justify-center relative">
              {navigationItems.map((item, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleCategoryClick(item.value)}
                    className="text-white hover:text-amber-100 hover:bg-amber-700/40 px-5 py-2 text-[13px] font-medium transition-all duration-300 border-r border-amber-600/20 last:border-r-0 relative group overflow-hidden flex items-center"
                  >
                    <span className="flex items-center space-x-2 relative z-10">
                      <span className="text-[18px] transform transition-transform duration-300 group-hover:scale-125">
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="h-5 w-5 object-contain"
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

        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleCategoryClick(item.value)}
                  className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center justify-between transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="text-[20px]">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="h-6 w-6 object-contain"
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
              className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center space-x-3.5 hover:pl-6 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-[20px]">🏪</span>
              <span>VENDORS</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center space-x-3.5 hover:pl-6 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-[20px]">📦</span>
              <span>ORDERS</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button
              onClick={() => navigate('/mart-login')}
              className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center space-x-3.5 hover:pl-6 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-[20px]">🔑</span>
              <span>LOGIN</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
            <button className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center space-x-3.5 hover:pl-6 transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-[20px]">ℹ️</span>
              <span>ABOUT US</span>
              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="h-[60px] md:h-[100px]"></div>

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
      `}</style>
    </>
  );
};

export default Header;