import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Package,
  CreditCard,
  User,
  MapPin,
  Phone,
  Calendar,
  Loader2
} from 'lucide-react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

const MartOrdersPage = ({ isVendor = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const userId = localStorage.getItem(isVendor ? 'vendorId' : 'customerId');

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const ordersRef = ref(db, `${isVendor ? 'Vendors' : 'Users'}/${userId}/Orders${isVendor ? '/New Orders' : ''}`);

    setLoading(true);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date()
        })).sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, isVendor]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!userId) return;

    const db = getDatabase();
    const orderRef = ref(db, `Vendors/${userId}/Orders/New Orders/${orderId}`);

    try {
      await update(orderRef, { status: newStatus });
      
      // Also update the customer's order status
      const order = orders.find(o => o.id === orderId);
      if (order && order.customerId) {
        const customerOrderRef = ref(db, `Users/${order.customerId}/Orders/${orderId}`);
        await update(customerOrderRef, { status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-amber-100 text-amber-800', text: 'Pending' };
      case 'processing':
        return { icon: <Truck className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800', text: 'Processing' };
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'cancelled':
        return { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800', text: 'Cancelled' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-2 sm:px-4 mt-4 sm:mt-10 min-h-[100vh]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            {isVendor ? 'Mart Orders' : 'My Orders'}
          </h1>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide px-1 sm:px-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
              activeTab === 'all' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'
            }`}
          >
            All Orders
          </button>
          {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium capitalize ${
                activeTab === status ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
          >
            <Package className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {activeTab === 'all' ? "You don't have any orders yet" : `No ${activeTab} orders`}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const status = getStatusDetails(order.status);
              const itemCount = Object.keys(order.items || {}).length;
              const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
                return sum + (item.noOfItems || item.quantity || 1);
              }, 0);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div 
                    className={`p-3 sm:p-4 flex justify-between items-center cursor-pointer ${
                      expandedOrder === order.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`h-8 sm:h-10 w-8 sm:w-10 rounded-full flex items-center justify-center ${status.color}`}>
                        {status.icon}
                      </div>
                      <div className="max-w-[140px] sm:max-w-none">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          Order #{order.id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {order.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="mx-1 hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {order.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-medium text-gray-900 flex items-center justify-end">
                        <IndianRupee className="h-3 w-3 mr-0.5 sm:mr-1" />
                        {order.total?.toFixed(2) || '0.00'}
                      </p>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${status.color} capitalize mt-1`}>
                        {status.text}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                          {/* Order Summary */}
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2 flex items-center">
                              <Package className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                              Order Summary
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Items</span>
                                <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalItems} units)</span>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Payment</span>
                                <div className="flex items-center">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  <span className="capitalize">{order.paymentMethod || 'Unknown'}</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Total</span>
                                <span className="font-medium flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-0.5 sm:mr-1" />
                                  {order.total?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Customer Info (for vendors) */}
                          {isVendor && order.customerId && (
                            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2 flex items-center">
                                <User className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                                Customer Info
                              </h4>
                              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <div className="flex items-start">
                                  <MapPin className="h-3 w-3 mt-0.5 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="break-words">{order.shippingAddress || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span>{order.phoneNumber || 'No phone provided'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                              Items ({itemCount})
                            </h4>
                            <div className="space-y-2 sm:space-y-3">
                              {Object.entries(order.items || {}).map(([key, item]) => {
                                const quantity = item.noOfItems || item.quantity || 1;
                                return (
                                  <div key={key} className="flex items-start">
                                    <div className="flex-shrink-0 h-12 sm:h-14 w-12 sm:w-14 rounded-md overflow-hidden border border-gray-200 mr-2 sm:mr-3">
                                      <img
                                        src={item.image || 'https://via.placeholder.com/150'}
                                        alt={item.productName}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                        {item.productName || 'Unnamed Product'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.category || 'General'} • {item.quantity} {item.unit || 'unit'}
                                      </p>
                                      {item.variantDetails && (
                                        <p className="text-xs text-gray-400 truncate">{item.variantDetails}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs sm:text-sm font-medium flex items-center justify-end">
                                        <IndianRupee className="h-3 w-3 mr-0.5" />
                                        {(item.price * quantity).toFixed(2)}
                                      </p>
                                      <p className="text-xs text-gray-500">Qty: {quantity}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Status Actions (for vendors) */}
                          {isVendor && (
                            <div className="pt-1 sm:pt-2">
                              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 sm:mb-2">
                                Update Status
                              </h4>
                              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                {['processing', 'completed', 'cancelled'].map((status) => {
                                  const isCurrent = order.status === status;
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => !isCurrent && updateOrderStatus(order.id, status)}
                                      disabled={isCurrent}
                                      className={`py-1 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${
                                        isCurrent
                                          ? 'bg-gray-200 text-gray-600'
                                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MartOrdersPage;