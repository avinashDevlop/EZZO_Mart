import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, set, push } from "firebase/database";
import app from "../../../firebase";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const db = getDatabase(app);

const ProductView = () => {
  const { vendorId, category, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        const productRef = ref(db, `Vendors/${vendorId}/Products/${category}/${productId}`);
        const productSnapshot = await get(productRef);
        
        if (!productSnapshot.exists()) {
          throw new Error("Product not found");
        }
        
        const productData = productSnapshot.val();
        setProduct({
          ...productData,
          id: productId,
          categoryKey: category
        });

        const vendorRef = ref(db, `Vendors/${vendorId}`);
        const vendorSnapshot = await get(vendorRef);
        
        if (vendorSnapshot.exists()) {
          setVendor(vendorSnapshot.val());
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [vendorId, category, productId]);

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

  const getVariantDisplayName = (variant, index) => {
    const parts = [];
    if (variant.size) parts.push(`Size: ${variant.size}`);
    if (variant.color) parts.push(`Color: ${variant.color}`);
    if (variant.type) parts.push(`Type: ${variant.type}`);
    if (variant.weight) parts.push(`Weight: ${variant.weight}`);
    if (variant.unit) parts.push(`Unit: ${variant.unit}`);
    return parts.length > 0 ? parts.join(' | ') : `Variant ${index + 1}`;
  };

  const formatAddress = () => {
    if (!vendor?.address) return 'Address not available';
    
    const { street, area, city, state, pincode } = vendor.address;
    const parts = [street, area, city, state, pincode].filter(Boolean);
    return parts.join(', ');
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === (product.images?.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? (product.images?.length || 1) - 1 : prevIndex - 1
    );
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const userId = localStorage.getItem('customerId');
      
      if (!userId) {
        toast.error("Please login to add items to cart");
        return;
      }

      const currentVariant = product.variants?.[selectedVariant] || product;
      const cartItem = {
        productId: product.id,
        productName: product.productName,
        vendorId: vendorId,
        vendorName: vendor?.businessName || "Unknown Vendor",
        category: category,
        variantIndex: product.variants ? selectedVariant : null,
        variantDetails: product.variants ? getVariantDisplayName(currentVariant, selectedVariant) : null,
        image: product.images?.[0] || null,
        price: currentVariant.sellingPrice || product.sellingPrice,
        mrp: currentVariant.mrp || product.mrp,
        noOfItems: quantity,
        quantity: currentVariant.quantity || product.quantity,
        unit: currentVariant.unit || product.unit || '',
        addedAt: Date.now()
      };

      const cartRef = ref(db, `Users/${userId}/Cart`);
      const newCartItemRef = push(cartRef);
      await set(newCartItemRef, cartItem);

      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6">
          Product not found
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const currentVariant = product.variants?.[selectedVariant] || product;
  const images = product.images || [];
  const discount = getDiscountPercentage(currentVariant.mrp, currentVariant.sellingPrice);
  const price = currentVariant.sellingPrice || product.sellingPrice || 0;
  const totalPrice = price * quantity;
  const unit = currentVariant.unit || product.unit || '';

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to products
        </button>

        <div className="bg-white rounded-xl shadow-sm sm:shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="w-full md:w-1/2 p-2 sm:p-4 md:p-6">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwTDEyMCAxMDBMMTAwIDgwTDgwIDEwMEwxMDAgMTIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center space-x-1 sm:space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-amber-500 sm:w-4'
                              : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400"
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
              </div>

              {images.length > 1 && (
                <div className="mt-2 sm:mt-4 grid grid-cols-4 gap-1 sm:gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-16 sm:h-20 rounded-md overflow-hidden border transition-all ${
                        currentImageIndex === index
                          ? 'border-amber-500 border-2'
                          : 'border-transparent hover:border-gray-300 border'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.productName} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-3 sm:p-4 md:p-6">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {product.productName}
                </h1>
                
                {product.brand && (
                  <p className="text-base sm:text-lg text-gray-600 mb-2 sm:mb-4">
                    Brand: <span className="font-semibold">{product.brand}</span>
                  </p>
                )}

                <div className="flex items-center mb-2 sm:mb-4">
                  {discount > 0 && (
                    <span className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full mr-2 sm:mr-3">
                      -{discount}%
                    </span>
                  )}
                  <span className="text-xs sm:text-sm text-gray-500">
                    Category: <span className="font-medium capitalize">{category.replace('-', ' ')}</span>
                  </span>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline space-x-2 sm:space-x-3">
                    <span className="text-2xl sm:text-3xl font-bold text-amber-600">
                      {formatCurrency(price)}
                    </span>
                    {currentVariant.mrp && currentVariant.mrp > price && (
                      <span className="text-base sm:text-lg text-gray-500 line-through">
                        {formatCurrency(currentVariant.mrp)}
                      </span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Description</h3>
                    <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                {/* Variant Selection */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Variants</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {product.variants.map((variant, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedVariant(index);
                            setQuantity(1);
                          }}
                          className={`p-2 sm:p-3 rounded-lg border transition-all text-left ${
                            selectedVariant === index
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm sm:text-base font-medium text-gray-900">
                                {getVariantDisplayName(variant, index)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                Qty: {variant.quantity} {variant.unit || ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm sm:text-base font-semibold text-amber-600">
                                {formatCurrency(variant.sellingPrice)}
                              </div>
                              {variant.mrp && variant.mrp > variant.sellingPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatCurrency(variant.mrp)}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Total Section */}
                <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <span className="text-sm sm:text-base font-medium mr-2 sm:mr-3">Quantity:</span>
                      <div className="flex items-center">
                        <button 
                          onClick={decrementQuantity}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 sm:px-3 rounded-l-lg text-sm sm:text-base"
                        >
                          -
                        </button>
                        <div className="bg-white text-center py-1 px-2 sm:px-4 font-medium border-t border-b border-gray-300 text-sm sm:text-base">
                          {quantity}
                        </div>
                        <button 
                          onClick={incrementQuantity}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 sm:px-3 rounded-r-lg text-sm sm:text-base"
                        >
                          +
                        </button>
                        <span className="ml-2 text-xs sm:text-sm text-gray-600">X {currentVariant.quantity} {unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-medium">Total:</span>
                      <span className="ml-2 text-lg sm:text-xl font-bold text-amber-600">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Sold By</h3>
                  <div className="flex items-start">
                    <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 mt-1">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">{vendor?.businessName || 'Vendor'}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{formatAddress()}</p>
                      {vendor?.contactNumber && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Contact: {vendor.contactNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors ${
                    addingToCart ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center text-sm sm:text-base">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base">Add to Cart</span>
                  )}
                </button>
                <button className="flex-1 bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base">
                  Contact Vendor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {(product.specifications || currentVariant.specifications) && (
          <div className="bg-white rounded-xl shadow-sm sm:shadow-md mt-4 sm:mt-8 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {Object.entries(currentVariant.specifications || product.specifications || {}).map(([key, value]) => (
                <div key={key} className="border-b pb-1 sm:pb-2">
                  <span className="text-xs sm:text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                  <span className="text-xs sm:text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductView;