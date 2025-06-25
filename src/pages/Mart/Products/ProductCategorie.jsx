import React, { useState, useEffect, useCallback } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import app from "../../../firebase";

const db = getDatabase(app);

// Nearby cities mapping
const NEARBY_CITIES = {
  "visakhapatnam": ["vizianagaram", "anakapalle", "bheemunipatnam", "srikakulam", "tuni", "paravathipuram"],
  "vijayawada": ["guntur", "mangalagiri", "tadepalligudem", "nuzvid", "eluru", "amaravati"],
  "guntur": ["tenali", "mangalagiri", "ponnur", "bapatla", "narasaraopet"],
  "nellore": ["gudur", "kavali", "sullurpeta", "naidupet", "venkatagiri"],
  "kakinada": ["rajahmundry", "samalkot", "tuni", "pithapuram", "peddapuram"],
  "tirupati": ["chittoor", "renigunta", "puttur", "srikalahasti", "chandragiri"],
  "kurnool": ["nandyal", "adoni", "dhone", "yemmiganur", "nandikotkur"],
  "anantapur": ["hindupur", "dharmavaram", "kadiri", "tadipatri", "guntakal"],
  "kadapa": ["proddatur", "rayachoti", "pulivendula", "jammalamadugu", "badvel"],
  "ongole": ["chirala", "addanki", "markapur", "kandukur", "darsi"],
  "rajahmundry": ["kovvur", "mandapeta", "tadepalligudem", "amalapuram", "tanuku"],
  "eluru": ["bhimavaram", "tadepalligudem", "nidadavole", "palakollu", "jangareddygudem"],
  "chittoor": ["puttur", "madhanapalle", "palmaner", "kuppam", "bangarupalem"],
  "paravathipuram": ["salur", "bobbili", "kurupam", "ramabhadrapuram", "komarada", "vizianagaram","visakhapatnam"],
};

const CONSTRUCTION_CATEGORIES = [
  "ready-mix-concrete",
  "cement",
  "bricks",
  "tiles",
  "steel"
];

const QUANTITY_DISPLAY_CATEGORIES = [
  "ready-mix-concrete",
  "cement",
  "bricks",
  "tiles",
  "steel",
  "paint",
  "electrical",
  "plumbing"
];

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 - ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
  { label: "Over ₹20,000", min: 20000, max: Infinity }
];

const ProductCatalog = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const locationData = JSON.parse(localStorage.getItem('customerLocation') || '{}');
  const { pincode, state, city } = locationData;

  const categories = [
    { value: "ready-mix-concrete", label: "Ready-Mix Concrete" },
    { value: "cement", label: "Cement" },
    { value: "bricks", label: "Bricks" },
    { value: "tiles", label: "Tiles" },
    { value: "steel", label: "Steel" },
    { value: "tools", label: "Tools" },
    { value: "paint", label: "Paint" },
    { value: "electrical", label: "Electrical" },
    { value: "plumbing", label: "Plumbing" },
    { value: "furniture", label: "Furniture" },
  ];

  const [products, setProducts] = useState([]);
  // const [vendors, setVendors] = useState({});
  const [currentLocationProducts, setCurrentLocationProducts] = useState([]);
  const [nearbyLocationProducts, setNearbyLocationProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory] = useState(category || "");
  
  // Filter states
  const [priceRange, setPriceRange] = useState(null);
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [brandFilter, setBrandFilter] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const fetchVendors = useCallback(async () => {
    try {
      if (!pincode && !state && !city) {
        throw new Error("Location information not found. Please set your location first.");
      }

      const vendorsRef = ref(db, "Vendors");
      const vendorsSnapshot = await get(vendorsRef);
      
      if (!vendorsSnapshot.exists()) {
        return {};
      }

      const vendorsData = vendorsSnapshot.val();
      const matchedVendors = {};
      const currentCity = city?.toLowerCase().trim();
      const currentState = state?.toLowerCase().trim();
      const isConstructionMaterial = CONSTRUCTION_CATEGORIES.includes(selectedCategory);

      const nearbyCities = isConstructionMaterial 
        ? NEARBY_CITIES[currentCity] || []
        : [];

      Object.keys(vendorsData).forEach(vendorId => {
        const vendor = vendorsData[vendorId];
        
        if (!vendor.address) return;
        
        const vendorCity = vendor.address.city?.toLowerCase().trim();
        const vendorState = vendor.address.state?.toLowerCase().trim();
        const vendorPincode = vendor.address.pincode;

        if (pincode && vendorPincode === pincode) {
          matchedVendors[vendorId] = {
            ...vendor,
            locationType: 'exact'
          };
          return;
        }
        
        if (currentCity && currentState && 
            vendorCity === currentCity && 
            vendorState === currentState) {
          matchedVendors[vendorId] = {
            ...vendor,
            locationType: 'exact'
          };
          return;
        }
        
        if (isConstructionMaterial && currentCity && currentState && 
            nearbyCities.some(nearbyCity => vendorCity === nearbyCity) && 
            vendorState === currentState) {
          matchedVendors[vendorId] = {
            ...vendor,
            locationType: 'nearby'
          };
        }
      });

      return matchedVendors;
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(err.message);
      return {};
    }
  }, [pincode, state, city, selectedCategory]);  

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const vendorsData = await fetchVendors();
      // setVendors(vendorsData);

      if (Object.keys(vendorsData).length === 0) {
        setProducts([]);
        setCurrentLocationProducts([]);
        setNearbyLocationProducts([]);
        return;
      }

      const allProducts = [];
      const currentLocationProducts = [];
      const nearbyLocationProducts = [];
      const brands = new Set();

      const vendorPromises = Object.keys(vendorsData).map(async (vendorId) => {
        const vendor = vendorsData[vendorId];
        const productsRef = ref(db, `Vendors/${vendorId}/Products`);

        // const categoryPath = selectedCategory ? `/${selectedCategory}` : '';
        const productsQuery = selectedCategory 
          ? ref(db, `Vendors/${vendorId}/Products/${selectedCategory}`)
          : productsRef;

        const snapshot = await get(productsQuery);
        if (snapshot.exists()) {
          const productsData = snapshot.val();

          if (selectedCategory) {
            Object.keys(productsData).forEach((productId) => {
              const product = {
                ...productsData[productId],
                id: productId,
                vendorId,
                vendorInfo: {
                  businessName: vendor.businessName || vendorId,
                  address: vendor.address,
                  contact: vendor.contactNumber,
                  isNearbyCity: vendor.locationType === 'nearby'
                },
                categoryKey: selectedCategory
              };
              
              if (product.brand) {
                brands.add(product.brand);
              }
              
              allProducts.push(product);
              if (vendor.locationType === 'exact') {
                currentLocationProducts.push(product);
              } else if (vendor.locationType === 'nearby') {
                nearbyLocationProducts.push(product);
              }
            });
          } else {
            Object.keys(productsData).forEach((categoryKey) => {
              const categoryProducts = productsData[categoryKey];
              Object.keys(categoryProducts).forEach((productId) => {
                const product = {
                  ...categoryProducts[productId],
                  id: productId,
                  vendorId,
                  vendorInfo: {
                    businessName: vendor.businessName || vendorId,
                    address: vendor.address,
                    contact: vendor.contactNumber,
                    isNearbyCity: vendor.locationType === 'nearby'
                  },
                  categoryKey
                };
                
                if (product.brand) {
                  brands.add(product.brand);
                }
                
                allProducts.push(product);
                if (vendor.locationType === 'exact') {
                  currentLocationProducts.push(product);
                } else if (vendor.locationType === 'nearby') {
                  nearbyLocationProducts.push(product);
                }
              });
            });
          }
        }
      });

      await Promise.all(vendorPromises);
      setProducts(allProducts);
      setCurrentLocationProducts(currentLocationProducts);
      setNearbyLocationProducts(nearbyLocationProducts);
      setAvailableBrands(Array.from(brands).sort());
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [fetchVendors, selectedCategory]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProductPriceRange = (product) => {
    if (product.sellingPrice) {
      return {
        min: product.sellingPrice,
        max: product.sellingPrice,
        mrp: product.mrp
      };
    }
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.sellingPrice || 0);
      const mrps = product.variants.map(v => v.mrp || 0);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        mrp: Math.max(...mrps)
      };
    }
    return { min: 0, max: 0, mrp: 0 };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountPercentage = (mrp, sellingPrice) => {
    if (mrp && sellingPrice && mrp > sellingPrice) {
      return Math.round(((mrp - sellingPrice) / mrp) * 100);
    }
    return 0;
  };

  const getCategoryLabel = (categoryKey) => {
    const category = categories.find(cat => cat.value === categoryKey);
    return category ? category.label : categoryKey;
  };

  const getVariantDisplayName = (variant, index) => {
    const parts = [];
    if (variant.size) parts.push(`Size: ${variant.size}`);
    if (variant.color) parts.push(`Color: ${variant.color}`);
    if (variant.type) parts.push(`Type: ${variant.type}`);
    if (variant.weight) parts.push(`Weight: ${variant.weight}`);
    if (variant.unit) parts.push(`Unit: ${variant.unit}`);
    return parts.length > 0 ? parts.join(' | ') : `Variant ${index + 1}`;
  };

  const getVariantColor = (variant) => {
    if (variant.color) {
      const colorName = variant.color.toLowerCase();
      const colorMap = {
        'white': '#FFFFFF', 'black': '#000000', 'red': '#FF0000',
        'blue': '#0000FF', 'green': '#008000', 'yellow': '#FFFF00',
        'orange': '#FFA500', 'purple': '#800080', 'pink': '#FFC0CB',
        'brown': '#A52A2A', 'gray': '#808080', 'grey': '#808080',
        'beige': '#F5F5DC', 'cream': '#FFFDD0', 'ivory': '#FFFFF0'
      };
      return colorMap[colorName] || '#E5E7EB';
    }
    return '#E5E7EB';
  };

  const shouldShowQuantity = (product) => {
    if (QUANTITY_DISPLAY_CATEGORIES.includes(product.categoryKey)) {
      return true;
    }
    
    if (!product.variants || product.variants.length === 1) {
      return product.quantity || (product.variants && product.variants[0]?.quantity);
    }
    
    return false;
  };

  const getQuantityDisplay = (product) => {
    if (!shouldShowQuantity(product)) return null;
    
    if (product.variants && product.variants.length === 1) {
      return {
        quantity: product.variants[0].quantity,
        unit: product.variants[0].unit || product.unit
      };
    }
    
    return {
      quantity: product.quantity,
      unit: product.unit
    };
  };

  const applyFilters = (products) => {
    let filtered = [...products];

    // Apply price range filter
    if (priceRange) {
      filtered = filtered.filter(product => {
        const { min, max } = getProductPriceRange(product);
        return min >= priceRange.min && max <= priceRange.max;
      });
    }

    // Apply location filter
    if (locationFilter === 'current') {
      filtered = filtered.filter(product => !product.vendorInfo.isNearbyCity);
    } else if (locationFilter === 'nearby') {
      filtered = filtered.filter(product => product.vendorInfo.isNearbyCity);
    }

    // Apply brand filter
    if (brandFilter) {
      filtered = filtered.filter(product => 
        product.brand && product.brand.toLowerCase().includes(brandFilter.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low-to-high':
        filtered.sort((a, b) => {
          const aPrice = getProductPriceRange(a).min;
          const bPrice = getProductPriceRange(b).min;
          return aPrice - bPrice;
        });
        break;
      case 'price-high-to-low':
        filtered.sort((a, b) => {
          const aPrice = getProductPriceRange(a).max;
          const bPrice = getProductPriceRange(b).max;
          return bPrice - aPrice;
        });
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const aDiscount = getDiscountPercentage(getProductPriceRange(a).mrp, getProductPriceRange(a).min);
          const bDiscount = getDiscountPercentage(getProductPriceRange(b).mrp, getProductPriceRange(b).min);
          return bDiscount - aDiscount;
        });
        break;
      default:
        // Default sorting (by relevance or as they come)
        break;
    }

    return filtered;
  };

  const clearFilters = () => {
    setPriceRange(null);
    setLocationFilter('all');
    setSortBy('default');
    setBrandFilter('');
  };

  const hasActiveFilters = priceRange || locationFilter !== 'all' || sortBy !== 'default' || brandFilter;

  const FilterDropdown = ({ label, value, options, onChange }) => (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  const VariantDisplay = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState(0);

    if (!product.variants || product.variants.length <= 1) {
      return null;
    }

    return (
      <div className="mt-3 border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Variants:</span>
          <span className="text-xs text-amber-600">{product.variants.length} options</span>
        </div>

        {product.categoryKey === 'paint' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {product.variants.slice(0, 6).map((variant, index) => (
                <div
                  key={variant.id || index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(index);
                  }}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                    selectedVariant === index
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {variant.color && (
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: getVariantColor(variant) }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {variant.color || `Variant ${index + 1}`}
                      </div>
                      <div className="text-xs text-amber-600 font-semibold">
                        {formatCurrency(variant.sellingPrice || 0)}
                      </div>
                      {variant.quantity && (
                        <div className="text-xs text-gray-500">
                          Qty: {variant.quantity} {variant.unit ? variant.unit : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {product.variants.length > 6 && (
              <div className="text-center text-xs text-gray-500 py-1 border border-dashed border-gray-200 rounded">
                +{product.variants.length - 6} more variants available
              </div>
            )}
          </div>
        )}

        {product.categoryKey !== 'paint' && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {product.variants.slice(0, 4).map((variant, index) => (
              <div
                key={variant.id || index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVariant(index);
                }}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  selectedVariant === index
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {getVariantDisplayName(variant, index)}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    {variant.quantity && (
                      <span className="text-xs text-gray-600">
                        Qty: {variant.quantity} {variant.unit ? variant.unit : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-600">
                    {formatCurrency(variant.sellingPrice || 0)}
                  </div>
                  {variant.mrp && variant.mrp > variant.sellingPrice && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(variant.mrp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {product.variants.length > 4 && (
              <div className="text-center text-xs text-gray-500 py-2 border border-dashed border-gray-200 rounded">
                +{product.variants.length - 4} more variants
              </div>
            )}
          </div>
        )}

        {product.variants[selectedVariant] && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="text-sm font-medium text-gray-800 mb-2">Selected Variant Details:</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-600">Price: </span>
                <span className="font-semibold text-amber-600">
                  {formatCurrency(product.variants[selectedVariant].sellingPrice || 0)}
                </span>
              </div>
              {product.variants[selectedVariant].mrp && (
                <div>
                  <span className="text-gray-600">MRP: </span>
                  <span className="text-red-500 line-through">
                    {formatCurrency(product.variants[selectedVariant].mrp)}
                  </span>
                </div>
              )}

              {product.variants[selectedVariant].quantity && (
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-600">Quantity: </span>
                      <span className="font-bold">
                        {product.variants[selectedVariant].quantity}
                      </span>
                      {product.variants[selectedVariant].unit && (
                        <span className="text-gray-500 ml-1">
                          {product.variants[selectedVariant].unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {product.variants[selectedVariant].size && (
                <div>
                  <span className="text-gray-600">Size: </span>
                  <span className="font-medium">
                    {product.variants[selectedVariant].size}
                  </span>
                </div>
              )}
              {product.variants[selectedVariant].color && (
                <div>
                  <span className="text-gray-600">Color: </span>
                  <span className="font-medium">
                    {product.variants[selectedVariant].color}
                  </span>
                </div>
              )}
              {product.variants[selectedVariant].weight && (
                <div>
                  <span className="text-gray-600">Weight: </span>
                  <span className="font-medium">
                    {product.variants[selectedVariant].weight}
                  </span>
                </div>
              )}
              {product.variants[selectedVariant].type && (
                <div>
                  <span className="text-gray-600">Type: </span>
                  <span className="font-medium">
                    {product.variants[selectedVariant].type}
                  </span>
                </div>
              )}
            </div>

            {product.variants[selectedVariant].mrp && product.variants[selectedVariant].sellingPrice &&
              product.variants[selectedVariant].mrp > product.variants[selectedVariant].sellingPrice && (
                <div className="mt-2 text-center">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Save {getDiscountPercentage(product.variants[selectedVariant].mrp, product.variants[selectedVariant].sellingPrice)}%
                  </span>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  const ProductCard = ({ product }) => {
    const priceRange = getProductPriceRange(product);
    const images = product.images || [];
    const discount = getDiscountPercentage(priceRange.mrp, priceRange.min);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const quantityDisplay = getQuantityDisplay(product);

    const nextImage = (e) => {
      e.stopPropagation();
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    };

    const prevImage = (e) => {
      e.stopPropagation();
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    };

    const formatAddress = () => {
      if (!product.vendorInfo.address) return 'Address not available';
      
      const { street, area, city, state, pincode } = product.vendorInfo.address;
      const parts = [street, area, city, state, pincode].filter(Boolean);
      return parts.join(', ');
    };

    const handleCardClick = () => {
      navigate(`/vendor/${product.vendorId}/products/${product.categoryKey}/${product.id}`);
    };

    return (
      <div 
        onClick={handleCardClick}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-amber-100 overflow-hidden cursor-pointer group"
      >
        <div className="relative h-48 bg-gray-100">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={product.productName}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDEyMCAxMDBMMTAwIDgwTDgwIDEwMEwxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-amber-500 w-3'
                          : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            </div>
          )}

          {product.variants && product.variants.length > 1 && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                {product.variants.length} variants
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start mb-3 pb-2 border-b">
            <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center mr-2 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="text-sm font-semibold text-gray-900">{product.vendorInfo.businessName}</h4>
                {product.vendorInfo.isNearbyCity && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    Nearby City
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {formatAddress()}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.productName}
          </h3>

          {product.brand && (
            <p className="text-sm text-gray-600 mb-2">
              Brand: <span className="font-medium">{product.brand}</span>
            </p>
          )}
          {product.typeOfBrick && (
            <p className="text-sm text-gray-600 mb-2">
              Type: <span className="font-medium">{product.typeOfBrick}</span>
            </p>
          )}
          {product.color && !product.variants && (
            <p className="text-sm text-gray-600 mb-2">
              Color: <span className="font-medium">{product.color}</span>
            </p>
          )}

          <div className="flex items-center gap-2 mb-3">
            {priceRange.min === priceRange.max ? (
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(priceRange.min)}
              </span>
            ) : (
              <span className="text-xl font-bold text-amber-600">
                {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
              </span>
            )}
            {priceRange.mrp > priceRange.max && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(priceRange.mrp)}
              </span>
            )}
          </div>

          {quantityDisplay && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Quantity:</span>
                <span className="ml-2 font-bold">
                  {quantityDisplay.quantity}
                </span>
                {quantityDisplay.unit && (
                  <span className="ml-1 text-gray-500">
                    {quantityDisplay.unit}
                  </span>
                )}
              </div>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <VariantDisplay product={product} />

          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-sm text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
              View Details
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 lg:mt-6">
      {/* Professional Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6">
            <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
              <button 
                onClick={() => {
                  window.history.back();
                  setTimeout(() => {
                    window.location.reload();
                  }, 100); // delay to allow navigation before reload
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 ml-2 sm:ml-0">
                {getCategoryLabel(selectedCategory)}
              </h1>
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="sm:hidden flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4 mt-4 sm:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </button>
              
              <FilterDropdown
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'default', label: 'Recommended' },
                  { value: 'price-low-to-high', label: 'Price: Low to High' },
                  { value: 'price-high-to-low', label: 'Price: High to Low' },
                  { value: 'discount', label: 'Best Discount' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsMobileFiltersOpen(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        type="button"
                        className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                        onClick={() => setIsMobileFiltersOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-6">
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {PRICE_RANGES.map((range) => (
                            <button
                              key={range.label}
                              onClick={() => setPriceRange(priceRange?.label === range.label ? null : range)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                priceRange?.label === range.label
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setLocationFilter('all')}
                            className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                              locationFilter === 'all'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            All Locations
                          </button>
                          <button
                            onClick={() => setLocationFilter('current')}
                            className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                              locationFilter === 'current'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Current City Only
                          </button>
                          {CONSTRUCTION_CATEGORIES.includes(selectedCategory) && (
                            <button
                              onClick={() => setLocationFilter('nearby')}
                              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                                locationFilter === 'nearby'
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Nearby Cities
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
                        <FilterDropdown
                          label="Sort by"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          options={[
                            { value: 'default', label: 'Recommended' },
                            { value: 'price-low-to-high', label: 'Price: Low to High' },
                            { value: 'price-high-to-low', label: 'Price: High to Low' },
                            { value: 'discount', label: 'Best Discount' }
                          ]}
                        />
                      </div>

                      {availableBrands.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
                          <div className="relative">
                            <select
                              value={brandFilter}
                              onChange={(e) => setBrandFilter(e.target.value)}
                              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full"
                            >
                              <option value="">All Brands</option>
                              {availableBrands.map((brand) => (
                                <option key={brand} value={brand}>
                                  {brand}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between space-x-4">
                      <button
                        onClick={clearFilters}
                        className="flex-1 bg-white border border-gray-300 rounded-lg py-3 px-4 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="flex-1 bg-amber-600 border border-transparent rounded-lg py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-amber-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel (Desktop) */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 hidden sm:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange(priceRange?.label === range.label ? null : range)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        priceRange?.label === range.label
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLocationFilter('all')}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      locationFilter === 'all'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Locations
                  </button>
                  <button
                    onClick={() => setLocationFilter('current')}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      locationFilter === 'current'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Current City Only
                  </button>
                  {CONSTRUCTION_CATEGORIES.includes(selectedCategory) && (
                    <button
                      onClick={() => setLocationFilter('nearby')}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        locationFilter === 'nearby'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Nearby Cities
                    </button>
                  )}
                </div>
              </div>

              {availableBrands.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <div className="relative">
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">All Brands</option>
                      {availableBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Category Description */}
        {selectedCategory && (
          <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="bg-amber-50 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  {getCategoryLabel(selectedCategory)} Products
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {CONSTRUCTION_CATEGORIES.includes(selectedCategory) ? (
                    <>
                      Showing products available in your location ({city}, {state}) and nearby construction material hubs
                    </>
                  ) : (
                    <>
                      Showing products available in your location ({city}, {state})
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-4 border-b-4 border-amber-500 mb-3 sm:mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            {error.includes("Location information") && (
              <button
                onClick={() => navigate('/location')}
                className="mt-2 sm:mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors"
              >
                Set Your Location
              </button>
            )}
          </div>
        )}

        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <div>
                {/* Current Location Products */}
                {applyFilters(currentLocationProducts).length > 0 && (
                  <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Available in {city}
                      </h2>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {applyFilters(currentLocationProducts).length} products
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {applyFilters(currentLocationProducts).map((product) => (
                        <ProductCard key={`${product.vendorId}-${product.categoryKey}-${product.id}`} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby Location Products */}
                {applyFilters(nearbyLocationProducts).length > 0 && CONSTRUCTION_CATEGORIES.includes(selectedCategory) && (
                  <div className="mt-8 sm:mt-12">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Also available in nearby cities
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {applyFilters(nearbyLocationProducts).length} products
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {applyFilters(nearbyLocationProducts).map((product) => (
                        <ProductCard key={`${product.vendorId}-${product.categoryKey}-${product.id}`} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No results when filters are applied */}
                {applyFilters(currentLocationProducts).length === 0 && applyFilters(nearbyLocationProducts).length === 0 && hasActiveFilters && (
                  <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="mx-auto w-16 sm:w-24 h-16 sm:h-24 bg-amber-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <svg
                        className="w-8 sm:w-12 h-8 sm:h-12 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">No products match your filters</h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                      Try adjusting your filters or clear them to see all available products.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-16 sm:w-24 h-16 sm:h-24 bg-amber-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                  <svg
                    className="w-8 sm:w-12 h-8 sm:h-12 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">No products found</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                  {CONSTRUCTION_CATEGORIES.includes(selectedCategory)
                    ? "We couldn't find any vendors in your location or nearby cities with available products."
                    : "We couldn't find any vendors in your location with available products."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <button 
                    onClick={() => navigate("/location")}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors"
                  >
                    Change Location
                  </button>
                  <button 
                    onClick={() => navigate("/")}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;