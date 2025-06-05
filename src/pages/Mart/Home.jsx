import React, { useState, useEffect } from "react";
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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const categories = [
    {
      name: "Ready-Mix Concrete",
      icon: ReadyMixIcon,
      count: "85+",
      color: "from-stone-500 to-stone-700",
    },
    {
      name: "Cement",
      icon: CementIcon,
      count: "120+",
      color: "from-gray-500 to-gray-700",
    },
    {
      name: "Bricks",
      icon: BricksIcon,
      count: "100+",
      color: "from-orange-600 to-red-600",
    },
    {
      name: "Tiles",
      icon: TilesIcon,
      count: "150+",
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Steel",
      icon: SteelIcon,
      count: "90+",
      color: "from-yellow-600 to-yellow-800",
    },
    {
      name: "Paint",
      icon: PaintIcon,
      count: "110+",
      color: "from-pink-500 to-rose-600",
    },
    {
      name: "Tools",
      icon: ToolsIcon,
      count: "200+",
      color: "from-green-500 to-green-700",
    },
    {
      name: "Electrical",
      icon: ElectricalIcon,
      count: "130+",
      color: "from-amber-500 to-yellow-600",
    },
    {
      name: "Plumbing",
      icon: PlumbingIcon,
      count: "95+",
      color: "from-cyan-600 to-blue-700",
    },
    {
      name: "Furniture",
      icon: FurnitureIcon,
      count: "70+",
      color: "from-violet-600 to-purple-700",
    },
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
      {/* Hero Banner Carousel - Fixed: Removed margins */}
      <div className="relative h-[calc(100vh-80px)] max-h-[700px] min-h-[400px] overflow-hidden w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-90`}
            ></div>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image})` }}
            ></div>
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

        {/* Navigation Arrows - Smaller on mobile */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Slide Indicators - Smaller on mobile */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
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
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Heading Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            Explore our wide range of construction materials
          </p>
        </div>

        {/* Responsive Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`
          flex flex-col items-center justify-center p-6 rounded-xl text-white 
          bg-gradient-to-r ${cat.color} 
          shadow-lg
          transform transition-all duration-300 ease-in-out
          hover:scale-105 hover:shadow-xl
          cursor-pointer
          h-[180px]
          w-full
        `}
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-12 h-12 mb-3 object-contain"
              />
              <h4 className="text-lg font-semibold text-center">{cat.name}</h4>
              <span className="text-sm opacity-90">{cat.count} items</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-12 bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Customer Favorites
            </h2>
            <p className="text-gray-600 md:text-lg">
              Top-rated tools and equipment
            </p>
          </div>

          {/* Responsive grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="w-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100"
              >
                {/* Image container */}
                <div className="relative h-[120px] sm:h-[140px] md:h-[160px] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {product.discount}
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1 md:mb-2 line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-center mb-1 md:mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm text-gray-500 ml-0.5 md:ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="mb-2 md:mb-3">
                    <span className="text-base md:text-lg font-bold text-red-600">
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs md:text-sm text-gray-500 line-through ml-1 md:ml-1.5">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-1">
                    <ShoppingCart size={14} className="md:size-4" />
                    <span className="hidden xs:inline">Add</span> to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trusted Vendors Section */}
      <div className="py-12 sm:py-16 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Trusted Vendors
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Quality partners for quality products
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {vendors.map((vendor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2"
              >
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                  loading="lazy"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                  {vendor.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  {vendor.products} Products
                </p>
                <div className="flex items-center justify-center">
                  <Star className="text-yellow-400 fill-current w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-base sm:text-lg font-semibold ml-1">
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
      <button className="bg-white text-amber-800 px-5 py-3 sm:px-7 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center whitespace-nowrap min-w-[180px]">
        <Users className="inline mr-2" size={16} />
        Become a Vendor
      </button>
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
