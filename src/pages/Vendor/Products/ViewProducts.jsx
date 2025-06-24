import React, { useState, useEffect, useCallback } from "react";
import { getDatabase, ref, get, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";
import app from "../../../firebase";

const db = getDatabase(app);

const ViewProducts = () => {
  const navigate = useNavigate();
  const vendorBusinessName = localStorage.getItem("vendorBusiness");
  // const vendorEmail = localStorage.getItem("vendorEmail");

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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleEditProduct = (product) => {
    navigate('/vendor/products/add', { state: { productToEdit: product } });
    console.log(product)
  };

  const handleDeleteProduct = async (product) => {
    // Create a custom confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    dialog.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
      <p class="text-gray-600 mb-4">
        Are you sure you want to delete <span class="font-semibold">"${product.productName}"</span>? 
        This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-3">
        <button id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button id="confirm-btn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          Delete Product
        </button>
      </div>
    </div>
  `;

    // Append to body
    document.body.appendChild(dialog);

    // Wait for user action
    const result = await new Promise((resolve) => {
      dialog.querySelector('#cancel-btn').addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });

      dialog.querySelector('#confirm-btn').addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });
    });

    if (!result) return;

    try {
      setLoading(true);
      const productRef = ref(db, `Vendors/${vendorBusinessName}/Products/${product.categoryKey}/${product.id}`);
      await remove(productRef);

      // Show toast notification instead of alert
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
      toast.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      "${product.productName}" deleted successfully
    `;
      document.body.appendChild(toast);

      // Auto remove toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);

      // Refresh the product list
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);

      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
      errorToast.innerHTML = `
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Failed to delete: ${error.message}
    `;
      document.body.appendChild(errorToast);

      // Auto remove toast after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!vendorBusinessName) {
        throw new Error("Vendor business name not found. Please login again.");
      }

      const productsRef = ref(db, `Vendors/${vendorBusinessName}/Products`);
      const snapshot = await get(productsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsList = [];

        Object.keys(data).forEach((categoryKey) => {
          const categoryProducts = data[categoryKey];

          Object.keys(categoryProducts).forEach((productKey) => {
            const product = categoryProducts[productKey];

            let processedVariants = [];
            if (product.variants && typeof product.variants === 'object') {
              processedVariants = Object.keys(product.variants).map((variantKey) => ({
                id: variantKey,
                ...product.variants[variantKey]
              }));
            }

            productsList.push({
              id: productKey,
              categoryKey: categoryKey,
              ...product,
              variants: processedVariants.length > 0 ? processedVariants : null,
            });
          });
        });

        setProducts(productsList);
        setFilteredProducts(productsList);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [vendorBusinessName]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.categoryKey === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.typeOfBrick?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.productName?.localeCompare(b.productName));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.productName?.localeCompare(a.productName));
        break;
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = a.sellingPrice || (a.variants && a.variants[0]?.sellingPrice) || 0;
          const priceB = b.sellingPrice || (b.variants && b.variants[0]?.sellingPrice) || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = a.sellingPrice || (a.variants && a.variants[0]?.sellingPrice) || 0;
          const priceB = b.sellingPrice || (b.variants && b.variants[0]?.sellingPrice) || 0;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

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

  // const getProductImage = (product) => {
  //   if (product.images && product.images.length > 0) {
  //     return product.images[0];
  //   }
  //   return null;
  // };

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
        'white': '#FFFFFF',
        'black': '#000000',
        'red': '#FF0000',
        'blue': '#0000FF',
        'green': '#008000',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'brown': '#A52A2A',
        'gray': '#808080',
        'grey': '#808080',
        'beige': '#F5F5DC',
        'cream': '#FFFDD0',
        'ivory': '#FFFFF0'
      };
      return colorMap[colorName] || '#E5E7EB';
    }
    return '#E5E7EB';
  };

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
                  onClick={() => setSelectedVariant(index)}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${selectedVariant === index
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
                onClick={() => setSelectedVariant(index)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${selectedVariant === index
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

    const nextImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    };

    const prevImage = () => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-amber-100 overflow-hidden">
        <div className="relative h-48 bg-gray-100">
          {images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={product.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDEyMCAxMDBMMTAwIDgwTDgwIDEwMEwxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
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

          <div className="absolute top-2 left-2">
            <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {getCategoryLabel(product.categoryKey)}
            </span>
          </div>

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

          {product.quantity && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Quantity:</span>
                <span className="ml-2 font-bold">
                  {product.quantity}
                </span>
                {product.unit && (
                  <span className="ml-1 text-gray-500">
                    {product.unit}
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

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleEditProduct(product)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              Edit Product
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProduct(product);
              }}
              disabled={loading}
              className={`flex-1 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                }`}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-amber-100">Products</span>
            <span className="mx-2 text-white">/</span>
            <span className="text-white">View Products</span>
          </h1>
          <button
            onClick={fetchProducts}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, brand, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <svg
                  className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {selectedCategory && (
              <span className="ml-2 text-amber-600">
                in {getCategoryLabel(selectedCategory)}
              </span>
            )}
            {searchTerm && (
              <span className="ml-2 text-amber-600">
                matching "{searchTerm}"
              </span>
            )}
          </div>

          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={`${product.categoryKey}-${product.id}`} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first product"}
                </p>
                {!(searchTerm || selectedCategory) && (
                  <button 
                  onClick={() => navigate("/vendor/products/add")}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Add Product
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// const styles = `
// .line-clamp-2 {
//   overflow: hidden;
//   display: -webkit-box;
//   -webkit-box-orient: vertical;
//   -webkit-line-clamp: 2;
// }
// `;

export default ViewProducts;