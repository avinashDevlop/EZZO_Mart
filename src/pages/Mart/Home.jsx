import React, { useState, useEffect } from "react";
import MartLogin from './MartLogin';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Truck,
  Shield,
  Headphones,
  Award,
  ArrowRight,
  Users,
  Package,
  Wrench,
  HardHat,
} from "lucide-react";
import { Link } from 'react-router-dom';
import CementIcon from "./images/cement.png";
import BricksIcon from "./images/bricks.png";
import TilesIcon from "./images/tiles.png";
import SteelIcon from "./images/steel.png";
import PaintIcon from "./images/Paint.png";
import ToolsIcon from "./images/tools.png";
import ElectricalIcon from "./images/electrical.png";
import FurnitureIcon from "./images/furniture.png";
import ReadyMixIcon from "./images/mixTruck.png";
import PlumbingIcon from "./images/plumbing.png";

const Home = () => {

  const banners = [
    {
      id: 1,
      title: "Professional Construction Tools",
      subtitle: "Quality equipment for every project",
      description:
        "Discover our extensive range of construction tools and equipment from trusted vendors",
      image:
        "https://thumbs.dreamstime.com/b/construction-site-still-life-weathered-wooden-table-holds-stack-worn-leather-work-gloves-bright-yellow-hard-hat-372714043.jpg",
      cta: "Shop Tools",
      gradient: "from-orange-600 to-red-700",
    },
    {
      id: 2,
      title: "Heavy Machinery & Equipment",
      subtitle: "Power your biggest projects",
      description:
        "Industrial-grade machinery and equipment for large-scale construction projects",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
      cta: "View Equipment",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      id: 3,
      title: "Safety First Solutions",
      subtitle: "Protect your workforce",
      description:
        "Complete safety equipment and protective gear for construction sites",
      image:
        "https://cdn.pixabay.com/photo/2019/09/22/08/57/fire-fighting-4495488_1280.jpg",
      cta: "Safety Gear",
      gradient: "from-green-600 to-teal-700",
    },
  ];

  useEffect(() => {
    const logUserSession = () => {
      const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
      const customerId = localStorage.getItem('customerId');
      const customerEmail = localStorage.getItem('customerEmail');
      const customerLocation = JSON.parse(localStorage.getItem('customerLocation') || '{}');

      console.groupCollapsed('User Session Data');
      console.log('Customer Data:', customerData);
      console.log('Customer ID:', customerId);
      console.log('Customer Email:', customerEmail);
      console.log('Customer Location:', customerLocation);
      console.groupEnd();
    };

    logUserSession();
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  // Update your useEffect for the login timer
  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    const loginTimer = setTimeout(() => {
      const isLoggedIn = localStorage.getItem('customerId');
      if (!isLoggedIn) {
        setShowLogin(true);
      }
    }, 3000);

    return () => {
      clearInterval(carouselTimer);
      clearTimeout(loginTimer);
    };
  }, [banners.length]);

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const categories = [
    { name: "Ready-Mix Concrete", value: "ready-mix-concrete", icon: ReadyMixIcon, count: "85+", color: "from-stone-500 to-stone-700" },
    { name: "Cement", value: "cement", icon: CementIcon, count: "120+", color: "from-gray-500 to-gray-700" },
    { name: "Bricks", value: "bricks", icon: BricksIcon, count: "100+", color: "from-orange-600 to-red-600" },
    { name: "Tiles", value: "tiles", icon: TilesIcon, count: "150+", color: "from-blue-400 to-blue-600" },
    { name: "Steel", value: "steel", icon: SteelIcon, count: "90+", color: "from-yellow-600 to-yellow-800" },
    { name: "Paint", value: "paint", icon: PaintIcon, count: "110+", color: "from-pink-500 to-rose-600" },
    { name: "Tools", value: "tools", icon: ToolsIcon, count: "200+", color: "from-green-500 to-green-700" },
    { name: "Electrical", value: "electrical", icon: ElectricalIcon, count: "130+", color: "from-amber-500 to-yellow-600" },
    { name: "Plumbing", value: "plumbing", icon: PlumbingIcon, count: "95+", color: "from-cyan-600 to-blue-700" },
    { name: "Furniture", value: "furniture", icon: FurnitureIcon, count: "70+", color: "from-violet-600 to-purple-700" },
  ];


  const featuredProducts = [
    // Existing products (8 items)
    {
      id: 1,
      name: "Cement (10kg Pack)",
      price: "₹120",
      originalPrice: "₹150",
      rating: 4.5,
      reviews: 85,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmwpxgQAYEoofqHXGzCxgc8Mcp8YtbRPGZyA&s",
      discount: "20% OFF",
    },
    {
      id: 2,
      name: "Clay Bricks (10 pcs)",
      price: "₹130",
      originalPrice: "₹150",
      rating: 4.6,
      reviews: 67,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr7aG5OC8Xt3JNvcfzUURkiq6G9V8H_xycCA&s",
      discount: "13% OFF",
    },
    {
      id: 3,
      name: "Wall Paint (1L, White)",
      price: "₹299",
      originalPrice: "₹349",
      rating: 4.7,
      reviews: 42,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRK3I9zmyff16pRNUzFgsmG5TeWedBqSfykg&s",
      discount: "14% OFF",
    },
    {
      id: 4,
      name: "Sand (20kg Bag)",
      price: "₹99",
      originalPrice: "₹120",
      rating: 4.4,
      reviews: 53,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTML-DRDjcVQr4XpOJQMXuXc0sxAG6YVCkiSQ&s",
      discount: "17% OFF",
    },
    {
      id: 5,
      name: "Gravel Stones (25kg)",
      price: "₹149",
      originalPrice: "₹179",
      rating: 4.3,
      reviews: 39,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXupaxO28C7N1kZLFswDkNBcEtjmZ48tMLqw&s",
      discount: "17% OFF",
    },
    {
      id: 6,
      name: "Steel Rod (10mm, 1pc)",
      price: "₹199",
      originalPrice: "₹230",
      rating: 4.6,
      reviews: 33,
      image:
        "https://t4.ftcdn.net/jpg/02/70/54/01/360_F_270540128_SbIbnPpRno7A3BcZlO8gNqAjjKPJzYwI.jpg",
      discount: "13% OFF",
    },
    {
      id: 7,
      name: "PVC Pipe (1m, 1-inch)",
      price: "₹89",
      originalPrice: "₹110",
      rating: 4.5,
      reviews: 45,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbaOhn3U40r21MZ6z9lyz4Ysl8Kc8Eq30-Qw&s",
      discount: "19% OFF",
    },
    {
      id: 8,
      name: "Tile Adhesive (5kg Pack)",
      price: "₹349",
      originalPrice: "₹399",
      rating: 4.7,
      reviews: 51,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEK8sXFWPLAWeexbf65Gh90g1HCQav-TcENQ&s",
      discount: "13% OFF",
    },

    // New electrical and small quantity items (19 items)
    {
      id: 9,
      name: "LED Bulb (9W, White)",
      price: "₹79",
      originalPrice: "₹99",
      rating: 4.2,
      reviews: 68,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSik7rw4aLJCuhDIEDSb1sOp3_6Y27LwuF95g&s",
      discount: "20% OFF",
    },
    {
      id: 10,
      name: "Switch Socket (Single)",
      price: "₹49",
      originalPrice: "₹65",
      rating: 4.0,
      reviews: 42,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtaeneBBzKVhXztLZFZRNs1E8O-fi8-iOQ0Q&s",
      discount: "25% OFF",
    },
    {
      id: 11,
      name: "Electrical Wire (10m)",
      price: "₹129",
      originalPrice: "₹150",
      rating: 4.3,
      reviews: 37,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLOh_eJlWj0xiO18fAJs_TPQ_gHO2_zFRgcA&s",
      discount: "14% OFF",
    },
    {
      id: 12,
      name: "Circuit Breaker (6A)",
      price: "₹199",
      originalPrice: "₹240",
      rating: 4.1,
      reviews: 29,
      image:
        "https://5.imimg.com/data5/SELLER/Default/2023/10/354505575/ZW/EQ/WK/10222995/schneider-electric-c60n-c25-circuit-breaker-6a-2-pole-500x500.jpg",
      discount: "17% OFF",
    },
    {
      id: 13,
      name: "Extension Board (3 sockets)",
      price: "₹149",
      originalPrice: "₹180",
      rating: 4.4,
      reviews: 56,
      image:
        "https://m.media-amazon.com/images/I/61Kli1vbz3L._AC_UF1000,1000_QL80_.jpg",
      discount: "17% OFF",
    },
    {
      id: 14,
      name: "Conduit Pipe (3m)",
      price: "₹69",
      originalPrice: "₹85",
      rating: 3.9,
      reviews: 23,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEcZuPWF1p-_Zg3cBXgn_lWaVSNlwc-uNiZg&s",
      discount: "19% OFF",
    },
    {
      id: 15,
      name: "MCB Box (4 Way)",
      price: "₹249",
      originalPrice: "₹300",
      rating: 4.2,
      reviews: 31,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtcLGncx1BH1NnYXgC0_r2EuSsV-guuT_Bgw&s",
      discount: "17% OFF",
    },
    {
      id: 16,
      name: "Wall Lamp (LED)",
      price: "₹199",
      originalPrice: "₹250",
      rating: 4.3,
      reviews: 47,
      image:
        "https://images-cdn.ubuy.co.in/635367992ea7f850897c332d-minimalist-linear-wall-lamp-led.jpg",
      discount: "20% OFF",
    },
    {
      id: 17,
      name: "Ceiling Light (12W)",
      price: "₹349",
      originalPrice: "₹420",
      rating: 4.5,
      reviews: 39,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPO1IbrM3VMvcVvTBEUnmd9k-jgp4sPic4aQ&s",
      discount: "17% OFF",
    },
    {
      id: 18,
      name: "Ready-Mix Concrete (5kg)",
      price: "₹99",
      originalPrice: "₹120",
      rating: 4.0,
      reviews: 28,
      image:
        "https://m.media-amazon.com/images/I/71wgcw4zS5L._AC_UF1000,1000_QL80_.jpg",
      discount: "17% OFF",
    },
    {
      id: 19,
      name: "Wall Putty (1kg)",
      price: "₹59",
      originalPrice: "₹75",
      rating: 3.8,
      reviews: 19,
      image:
        "https://m.media-amazon.com/images/I/51ZGaFS2dZL._AC_UF1000,1000_QL80_.jpg",
      discount: "21% OFF",
    },
    {
      id: 20,
      name: "Tile Grout (500g)",
      price: "₹89",
      originalPrice: "₹110",
      rating: 4.1,
      reviews: 24,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSET8OgU2InSQugZaTwg3xOIyoODEFp3toaIw&s",
      discount: "19% OFF",
    },
  ];

  const vendors = [
    {
      name: "BuildTech Pro",
      products: "150+",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    },
    {
      name: "ToolMaster",
      products: "200+",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop",
    },
    {
      name: "SafetyFirst",
      products: "80+",
      rating: 4.9,
      image:
        "https://cdn.pixabay.com/photo/2019/09/22/08/57/fire-fighting-4495488_1280.jpg",
    },
    {
      name: "SteelWorks",
      products: "120+",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]); // Fixed: Added banners.length to dependency array

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="p-6">
              <MartLogin onSuccess={handleCloseLogin} />
            </div>
          </div>
        </div>
      )}

      {/* Modified Banner Section */}
      <div className="relative w-full mt-2 md:mt-0">
        {/* Mobile Banner */}
        <div className="md:hidden">
          <div className="relative h-[250px] sm:h-[200px] overflow-hidden">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`}></div>
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-md text-white">
                    <h1 className="text-xl font-bold mb-1 leading-tight line-clamp-2">
                      {banner.title}
                    </h1>
                    <button className="bg-white text-red-800 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg">
                      {banner.cta} <ArrowRight className="inline ml-1" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows - Mobile */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-1 rounded-full hover:bg-white/30 transition-all duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-1 rounded-full hover:bg-white/30 transition-all duration-300"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>

            {/* Slide Indicators - Mobile */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Banner */}
        <div className="hidden md:block h-[calc(100vh-80px)] max-h-[700px] min-h-[400px] overflow-hidden w-full">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`}></div>
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    {banner.title}
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl mb-2 text-orange-100">
                    {banner.subtitle}
                  </p>
                  <p className="text-base sm:text-lg mb-8 text-gray-200 max-w-lg">
                    {banner.description}
                  </p>
                  <button className="bg-white text-red-800 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    {banner.cta} <ArrowRight className="inline ml-2" size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows - Desktop */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators - Desktop */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-12 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: Truck,
                title: "Free Delivery",
                desc: "On orders above ₹5,000",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "100% secure transactions",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Expert customer service",
              },
              {
                icon: Award,
                title: "Quality Assured",
                desc: "Certified products only",
              },
              {
                icon: Package,
                title: "Mini Pack Options",
                desc: "Buy items in small quantities",
              },
              {
                icon: Wrench,
                title: "Sample Orders",
                desc: "Try before bulk buying",
              },
              {
                icon: HardHat,
                title: "Unit Price Display",
                desc: "See cost per piece/kg",
              },
              {
                icon: Users,
                title: "No Minimum Order",
                desc: "Perfect for homes & DIYers",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white" size={20} />
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-1 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            Explore our wide range of construction materials
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link
              to={`/products-categorie/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              key={index}
              className={`
        flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg sm:rounded-xl text-white 
        bg-gradient-to-r ${cat.color} 
        shadow-md hover:shadow-lg
        transform transition-all duration-300 ease-in-out
        hover:scale-[1.02] sm:hover:scale-105
        cursor-pointer
        h-[120px] sm:h-[150px] md:h-[180px]
        w-full
      `}
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 sm:mb-3 object-contain"
              />
              <h4 className="text-sm sm:text-base md:text-lg font-semibold text-center">
                {cat.name}
              </h4>
              <span className="text-xs sm:text-sm opacity-90">
                {cat.count} items
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-10 sm:py-12 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Customer Favorites
            </h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Top-rated tools and equipment
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition-shadow duration-300 overflow-hidden group border border-gray-100"
              >
                <div className="relative h-28 sm:h-36 md:h-40">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                      {product.discount}
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.8rem] sm:min-h-[3rem] md:min-h-[3.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[11px] sm:text-xs text-gray-500 ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through ml-1">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-red-600 hover:to-orange-600 transition duration-200 flex items-center justify-center gap-1">
                    <ShoppingCart size={13} className="sm:size-4" />
                    <span className="hidden xs:inline">Add</span> to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Trusted Vendors Section */}
      <div className="py-10 sm:py-14 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
              Trusted Vendors
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Quality partners for quality products
            </p>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full object-cover"
                  loading="lazy"
                />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {vendor.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-2">
                  {vendor.products} Products
                </p>
                <div className="flex items-center justify-center">
                  <Star className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span className="ml-1 text-sm sm:text-base font-semibold text-gray-700">
                    {vendor.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg sm:text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust EZZO Mart for their
            construction needs. Start your project with the right tools today.
          </p>
          <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/vendor-login">
              <button className="bg-white text-amber-800 px-5 py-3 sm:px-7 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center whitespace-nowrap min-w-[180px]">
                <Users className="inline mr-2" size={16} />
                Become a Vendor
              </button>
            </Link>
            <button className="bg-transparent border-2 border-white text-white px-5 py-3 sm:px-7 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-white hover:text-amber-800 transition-all duration-300 flex items-center whitespace-nowrap min-w-[180px]">
              <Package className="inline mr-2" size={16} />
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
