import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";

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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHoveringCart, setIsHoveringCart] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const dropdownRef = useRef(null);
  const categoryTimeoutRef = useRef(null);

  const navigationItems = [
    { 
      name: "Ready-Mix Concrete", 
      icon: ReadyMixIcon,
      subCategories: [
        { name: "High Strength Mix" },
        { name: "Quick Setting Mix" },
        { name: "Fiber Reinforced" },
        { name: "Lightweight Mix" },
        { name: "Waterproof Mix" },
        { name: "Ready to Use Mix" }
      ]
    },
    { 
      name: "Cement", 
      icon: CementIcon,
      subCategories: [
        { name: "Ordinary Portland Cement" },
        { name: "Rapid Hardening Cement" },
        { name: "White Cement" },
        { name: "Masonry Cement" },
        { name: "Mortar Mix" }
      ]
    },
    { 
      name: "Bricks", 
      icon: BricksIcon,
      subCategories: [
        { name: "Red Clay Bricks" },
        { name: "Fire Bricks" },
        { name: "Fly Ash Bricks" },
        { name: "Concrete Bricks" },
        { name: "Hollow Bricks" }
      ]
    },
    { 
      name: "Tiles", 
      icon: TilesIcon,
      subCategories: [
        { name: "Ceramic Tiles" },
        { name: "Porcelain Tiles" },
        { name: "Mosaic Tiles" },
        { name: "Floor Tiles" },
        { name: "Wall Tiles" }
      ]
    },
    { 
      name: "Steel", 
      icon: SteelIcon,
      subCategories: [
        { name: "TMT Bars" },
        { name: "Mild Steel Bars" },
        { name: "Galvanized Sheets" },
        { name: "Structural Steel" },
        { name: "Wire Mesh" }
      ]
    },
    { 
      name: "Tools", 
      icon: ToolsIcon,
      subCategories: [
        { name: "Hand Tools" },
        { name: "Power Tools" },
        { name: "Measuring Tools" },
        { name: "Safety Equipment" },
        { name: "Tool Kits" }
      ]
    },
    { 
      name: "Paint", 
      icon: PaintIcon,
      subCategories: [
        { name: "Interior Paint" },
        { name: "Exterior Paint" },
        { name: "Wood Paint" },
        { name: "Metal Paint" },
        { name: "Primers" }
      ]
    },
    { 
      name: "Electrical", 
      icon: ElectricalIcon,
      subCategories: [
        { name: "Wires & Cables" },
        { name: "Switches & Sockets" },
        { name: "Lighting" },
        { name: "Conduits" },
        { name: "Circuit Breakers" }
      ]
    },
    { 
      name: "Plumbing", 
      icon: PlumbingIcon,
      subCategories: [
        { name: "Pipes & Fittings" },
        { name: "Faucets" },
        { name: "Water Heaters" },
        { name: "Bathroom Accessories" },
        { name: "Water Tanks" }
      ]
    },
    { 
      name: "Furniture", 
      icon: FurnitureIcon,
      subCategories: [
        { name: "Office Furniture" },
        { name: "Home Furniture" },
        { name: "Outdoor Furniture" },
        { name: "Kitchen Cabinets" },
        { name: "Wardrobes" }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
    setActiveMobileCategory(null);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Add search logic here
  };

  const handleCategoryHover = (index) => {
    clearTimeout(categoryTimeoutRef.current);
    setHoveredCategory(index);
  };

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setHoveredCategory(null);
      }
    }, 300);
  };

  const handleSubmenuEnter = () => {
    clearTimeout(categoryTimeoutRef.current);
  };

  const handleSubmenuLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const toggleMobileCategory = (index) => {
    setActiveMobileCategory(activeMobileCategory === index ? null : index);
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-lg"
            : "bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-500 shadow-md"
        }`}
      >
        {/* Main Header */}
        <div className="relative px-5">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo with enhanced animation */}
            <div className="flex-shrink-0 group">
              <div className="relative">
                <div className="text-center group">
                  <div className="inline-flex flex-col items-center justify-center leading-none transform transition-all duration-300 group-hover:scale-[1.02] cursor-pointer">
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

            {/* Desktop Search with enhanced animations */}
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

            {/* Desktop Navigation with enhanced hover effects */}
            <div className="hidden md:flex items-center space-x-7">
              <button className="text-white hover:text-amber-100 transition-all duration-300 text-[15px] relative group">
                VENDORS
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button className="text-white hover:text-amber-100 transition-all duration-300 text-[15px] relative group">
                ABOUT US
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></span>
              </button>
              <button
                className="text-white hover:text-amber-100 relative group"
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <div className="relative transform transition-transform duration-300 hover:scale-110">
                  <ShoppingCart className="h-[22px] w-[22px] transition-all duration-300 group-hover:rotate-[15deg]" />
                  <span
                    className={`absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold transition-all duration-300 ${
                      isHoveringCart ? "animate-bounce" : ""
                    }`}
                  >
                    3
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile Icons with better animations */}
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
                onMouseEnter={() => setIsHoveringCart(true)}
                onMouseLeave={() => setIsHoveringCart(false)}
              >
                <ShoppingCart className="h-[22px] w-[22px] hover:rotate-[15deg] transition-transform duration-300" />
                <span
                  className={`absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold ${
                    isHoveringCart ? "animate-ping-once" : ""
                  }`}
                >
                  3
                </span>
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

        {/* Mobile Search with smooth animation */}
        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
            isSearchOpen ? "max-h-[68px] opacity-100" : "max-h-0 opacity-0"
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

        {/* Desktop Navigation Menu with Subcategories - Professional Layout */}
        <div className="hidden md:block bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 shadow-sm border-t border-amber-600/30 relative">
          <div className="px-5 py-2.5">
            <div className="flex justify-center relative">
              {navigationItems.map((item, index) => (
                <div 
                  key={index}
                  className="relative"
                  onMouseEnter={() => handleCategoryHover(index)}
                  onMouseLeave={handleCategoryLeave}
                >
                  <button
                    className={`text-white hover:text-amber-100 hover:bg-amber-700/40 px-5 py-2 text-[13px] font-medium transition-all duration-300 border-r border-amber-600/20 last:border-r-0 relative group overflow-hidden flex items-center ${
                      hoveredCategory === index ? "bg-amber-700/40" : ""
                    }`}
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
                    <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform duration-300 ${
                      hoveredCategory === index ? "rotate-180" : ""
                    }`} />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-500 group-hover:w-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Subcategories Panel - Professional Layout */}
          {hoveredCategory !== null && (
            <div 
              ref={dropdownRef}
              className="absolute left-0 w-full bg-white shadow-xl transition-all duration-300 ease-out"
              style={{
                top: '100%',
                height: hoveredCategory !== null ? 'auto' : 0,
                opacity: hoveredCategory !== null ? 1 : 0,
                transform: hoveredCategory !== null ? 'translateY(0)' : 'translateY(-10px)',
                pointerEvents: hoveredCategory !== null ? 'auto' : 'none'
              }}
              onMouseEnter={handleSubmenuEnter}
              onMouseLeave={handleSubmenuLeave}
            >
              <div className="container mx-auto px-5 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Main Subcategories Column */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-amber-700 border-b-2 border-amber-200 pb-3 mb-3 flex items-center">
                      <img
                        src={navigationItems[hoveredCategory]?.icon}
                        alt={navigationItems[hoveredCategory]?.name}
                        className="h-6 w-6 object-contain mr-3"
                      />
                      {navigationItems[hoveredCategory]?.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {navigationItems[hoveredCategory]?.subCategories.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          type="button"
                          className="group flex items-start p-3 rounded-lg hover:bg-amber-50 transition-all duration-300 hover:shadow-sm border border-transparent hover:border-amber-100 w-full text-left"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-3 h-3 bg-amber-400 rounded-full transform transition-transform duration-300 group-hover:scale-150 group-hover:bg-amber-500"></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-800 group-hover:text-amber-700 font-medium transition-colors duration-300">
                              {subItem.name}
                            </p>
                            <p className="text-xs text-gray-500 group-hover:text-amber-500 mt-1 transition-colors duration-300">
                              View all products →
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Content Columns */}
                  <div className="hidden lg:block col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Featured Products */}
                      <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                        <h4 className="text-lg font-semibold text-amber-700 mb-3">Featured in {navigationItems[hoveredCategory]?.name}</h4>
                        <div className="space-y-3">
                          {[1, 2, 3].map((item) => (
                            <button 
                              key={item} 
                              type="button"
                              className="flex items-center p-2 rounded-lg hover:bg-white transition-all duration-300 group w-full text-left"
                            >
                              <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-md flex items-center justify-center text-amber-700 group-hover:bg-amber-300 transition-colors duration-300">
                                {item}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors duration-300">
                                  Featured Product {item}
                                </p>
                                <p className="text-xs text-amber-600">Special offer</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-amber-700">Quick Links</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-300 text-center w-full"
                          >
                            <div className="text-amber-600 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700">Product Catalog</span>
                          </button>
                          <button
                            type="button"
                            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-300 text-center w-full"
                          >
                            <div className="text-amber-600 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700">Special Offers</span>
                          </button>
                          <button
                            type="button"
                            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-300 text-center w-full"
                          >
                            <div className="text-amber-600 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700">Bulk Orders</span>
                          </button>
                          <button
                            type="button"
                            className="p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-300 text-center w-full"
                          >
                            <div className="text-amber-600 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-gray-700">Contact Support</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Mobile Menu with Better Animations */}
        <div
          className={`md:hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative">
                <button
                  className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center justify-between transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => toggleMobileCategory(index)}
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
                  <ChevronDown 
                    className={`h-5 w-5 transform transition-transform duration-300 ${
                      activeMobileCategory === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {/* Mobile Subcategories with better animation */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeMobileCategory === index ? 'max-h-[500px]' : 'max-h-0'
                  }`}
                >
                  <div className="pl-12 pr-4 py-2 space-y-3">
                    {item.subCategories.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        type="button"
                        className="block text-amber-100 hover:text-white hover:bg-amber-600/30 px-3 py-2.5 rounded-md text-[14px] transition-all duration-300 flex items-center transform hover:translate-x-1 w-full text-left"
                      >
                        <span className="w-2 h-2 bg-amber-300 rounded-full mr-3 transition-all duration-300 group-hover:w-3 group-hover:h-3"></span>
                        {subItem.name}
                        <span className="ml-auto opacity-0 text-amber-200 transform -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button className="block w-full text-left text-white hover:bg-amber-600/40 px-4 py-3 rounded-md text-[16px] transition-all duration-300 flex items-center space-x-3.5 hover:pl-6 transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="text-[20px]">🏪</span>
              <span>VENDORS</span>
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

      {/* Spacer */}
      <div className="h-[60px] md:h-[100px]"></div>

      {/* Enhanced Animation styles */}
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
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes pulse {
          0%, 100% {
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