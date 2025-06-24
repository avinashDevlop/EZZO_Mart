import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  ChevronRight, 
  Plus, 
  Minus, 
  CheckCircle,
  IndianRupee,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, update, get, remove, onValue } from 'firebase/database';

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    const loadCartItems = () => {
      const userId = localStorage.getItem('customerId');
      if (!userId) {
        setIsLoading(false);
        return;
      }
      const db = getDatabase();
      const cartRef = ref(db, `Users/${userId}/Cart`);

      setIsLoading(true);
      
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const cartData = snapshot.val();
        if (cartData) {
          const itemsArray = Object.entries(cartData).map(([key, value]) => ({
            firebaseKey: key,
            ...value
          }));
          setCartItems(itemsArray);
        } else {
          setCartItems([]);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    const unsubscribe = loadCartItems();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const removeItem = async (firebaseKey) => {
    setIsRemoving(firebaseKey);
    
    const userId = localStorage.getItem('customerId');
    if (!userId) return;

    const db = getDatabase();
    const itemRef = ref(db, `Users/${userId}/Cart/${firebaseKey}`);

    try {
      await remove(itemRef);
    } catch (error) {
      console.error("Error removing item: ", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const updateQuantity = async (firebaseKey, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 999) return;
    
    const userId = localStorage.getItem('customerId');
    if (!userId) return;

    const db = getDatabase();
    const itemRef = ref(db, `Users/${userId}/Cart/${firebaseKey}`);

    try {
      await update(itemRef, { noOfItems: newQuantity });
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  }; 

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemCount = item.noOfItems !== undefined ? item.noOfItems : item.quantity || 1;
      return total + (item.price * itemCount);
    }, 0).toFixed(2);
  };

  const calculateSavings = () => {
    return (cartItems.reduce((total, item) => {
      const itemCount = item.noOfItems !== undefined ? item.noOfItems : item.quantity || 1;
      return total + ((item.originalPrice || item.price * 1.2) - item.price) * itemCount;
    }, 0)).toFixed(2);
  };

  const cleanImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    try {
      const cleaned = url.replace(/%25/g, '%').replace(/%20/g, ' ');
      new URL(cleaned);
      return cleaned;
    } catch {
      return 'https://via.placeholder.com/150';
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }

    setIsProcessing(true);
    const userId = localStorage.getItem('customerId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const db = getDatabase();
    
    try {
      // 1. Get cart items
      const cartRef = ref(db, `Users/${userId}/Cart`);
      const cartSnapshot = await get(cartRef);
      const cartItems = cartSnapshot.val();

      if (!cartItems) {
        throw new Error('Cart is empty');
      }

      // Group items by vendor
      const itemsByVendor = {};
      Object.values(cartItems).forEach(item => {
        if (!itemsByVendor[item.vendorId]) {
          itemsByVendor[item.vendorId] = [];
        }
        itemsByVendor[item.vendorId].push(item);
      });

      // 2. Create order in user's account
      const ordersRef = ref(db, `Users/${userId}/Orders`);
      const newOrderRef = push(ordersRef);
      
      const orderData = {
        items: cartItems,
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        total: Object.values(cartItems).reduce((sum, item) => {
          const quantity = item.noOfItems || 1;
          return sum + (item.price * quantity);
        }, 0)
      };

      await update(newOrderRef, orderData);
      const orderKey = newOrderRef.key;

      // 3. Create orders for each vendor
      await Promise.all(Object.keys(itemsByVendor).map(async (vendorId) => {
        const vendorOrderRef = ref(db, `Vendors/${vendorId}/Orders/New Orders`);
        const newVendorOrderRef = push(vendorOrderRef);
        
        const vendorOrderData = {
          items: itemsByVendor[vendorId],
          customerId: userId,
          orderId: orderKey,
          paymentMethod,
          status: 'pending',
          createdAt: new Date().toISOString(),
          total: itemsByVendor[vendorId].reduce((sum, item) => {
            const quantity = item.noOfItems || 1;
            return sum + (item.price * quantity);
          }, 0)
        };

        await update(newVendorOrderRef, vendorOrderData);
      }));

      // 4. Clear cart
      await remove(cartRef);

      // 5. Show success
      setOrderId(orderKey);
      setOrderSuccess(true);
    } catch (error) {
      console.error("Order failed: ", error);
      alert('Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCheckout = () => {
    setShowCheckout(false);
    setPaymentMethod(null);
    setUpiId('');
    setIsProcessing(false);
    setOrderSuccess(false);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Cart sidebar */}
      <div
        className={`absolute top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-200 bg-gradient-to-r from-amber-600 to-amber-500 text-white">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7" />
              <h2 className="text-xl sm:text-2xl font-bold">
                {orderSuccess ? 'Order Confirmed' : showCheckout ? 'Payment Options' : 'Your Cart'}
              </h2>
              {!orderSuccess && !showCheckout && (
                <span className="bg-white/90 text-amber-600 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm font-bold">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <button
              onClick={orderSuccess ? () => {
                resetCheckout();
                onClose();
              } : showCheckout ? resetCheckout : onClose}
              className="p-1 sm:p-1.5 rounded-full hover:bg-amber-700/50 transition-all duration-200 transform hover:rotate-90"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Cart content */}
          <div className="flex-1 overflow-y-auto">
            {orderSuccess ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500 mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">Your order ID is: {orderId}</p>
                <p className="text-sm sm:text-base text-gray-600 mb-6">We've sent a confirmation to your email.</p>
                <button
                  onClick={() => {
                    resetCheckout();
                    onClose();
                    navigate('/mart-orders');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                >
                  Track Order
                </button>
              </div>
            ) : showCheckout ? (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Select Payment Method</h2>
                  
                  <div className="space-y-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'cod' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">Cash on Delivery</h3>
                          <p className="text-sm text-gray-500">Pay when you receive your order</p>
                        </div>
                        <IndianRupee className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <div className="flex items-center">
                        <div className={`h-5 w-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                          {paymentMethod === 'upi' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">UPI Payment</h3>
                          <p className="text-sm text-gray-500">Instant and secure payment</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {paymentMethod === 'upi' && (
                        <div className="mt-3 pl-8">
                          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">e.g. 1234567890@ybl or name@oksbi</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={!paymentMethod || isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-bold ${isProcessing ? 'bg-amber-400' : 'bg-amber-500 hover:bg-amber-600'} text-white transition-colors flex items-center justify-center`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Place Order ${paymentMethod === 'cod' ? '(Cash on Delivery)' : '(UPI Payment)'}`
                  )}
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
                <div className="relative mb-4 sm:mb-6">
                  <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 text-gray-200" />
                  <div className="absolute -inset-3 sm:-inset-4 rounded-full bg-amber-100/30 animate-ping opacity-75"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-800">Your cart is empty</h3>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">Add some products to get started</p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/');
                  }}
                  className="mt-4 sm:mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center group text-sm sm:text-base"
                >
                  <span>Browse Products</span>
                  <ChevronRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const itemCount = item.noOfItems !== undefined ? item.noOfItems : item.quantity || 1;
                  const totalPrice = (item.price * itemCount).toFixed(2);
                  
                  return (
                    <li 
                      key={item.firebaseKey} 
                      className={`transition-all duration-300 ${isRemoving === item.firebaseKey ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start">
                          {/* Product image */}
                          <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                            <img
                              src={cleanImageUrl(item.image)}
                              alt={item.productName || 'Product image'}
                              className="h-full w-full object-cover object-center"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                            {itemCount > 1 && (
                              <span className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-amber-600 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                                {itemCount}
                              </span>
                            )}
                          </div>
                          
                          {/* Product details */}
                          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                            <div className="flex justify-between">
                              <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 truncate">
                                  {item.productName || 'Unnamed Product'}
                                </h3>
                                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 capitalize truncate">
                                  {item.category || 'General'}
                                </p>
                                {item.variantDetails && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                                    {item.quantity} {item.unit || 'unit'}
                                  </p>
                                )}
                              </div>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 ml-2 whitespace-nowrap">
                                ₹{totalPrice}
                              </p>
                            </div>
                            
                            {/* Quantity controls */}
                            <div className="flex items-center justify-between mt-2 sm:mt-3">
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                <button
                                  onClick={() => updateQuantity(item.firebaseKey, itemCount - 1)}
                                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                                  disabled={itemCount <= 1}
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium w-8 sm:w-10 text-center">
                                  {itemCount}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.firebaseKey, itemCount + 1)}
                                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.firebaseKey)}
                                className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-red-50"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                            
                            {/* Unit price */}
                            <div className="mt-1 sm:mt-2 text-xs text-gray-400 truncate">
                              ₹{item.price?.toFixed(2) || '0.00'} for {item.quantity || 'quantity'} {item.unit || 'unit'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer with checkout */}
          {!showCheckout && !orderSuccess && cartItems.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
              {/* Order summary */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-green-600">
                  <span>You save</span>
                  <span>₹{calculateSavings()}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
              
              {/* Checkout button */}
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-bold shadow-md hover:shadow-lg flex items-center justify-center group text-sm sm:text-base"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;