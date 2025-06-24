import React, { useState, useEffect } from 'react';
import { 
  Clock,
  IndianRupee,
  Package,
  User,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

const VendorNewOrders = () => {
  const [newOrders, setNewOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const business = localStorage.getItem("vendorBusiness");

  useEffect(() => {
    if (!business) return;

    const db = getDatabase();
    const newOrdersRef = ref(db, `Vendors/${business}/Orders/New Orders`);

    setLoading(true);
    const unsubscribe = onValue(newOrdersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date()
        })).sort((a, b) => b.createdAt - a.createdAt);
        setNewOrders(ordersArray);
      } else {
        setNewOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [business]);

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!business) return;

    const db = getDatabase();
    
    try {
      // Remove from New Orders
      const currentRef = ref(db, `Vendors/${business}/Orders/New Orders/${orderId}`);
      await update(currentRef, null);
      
      // Add to the new status category
      const order = newOrders.find(o => o.id === orderId);
      const newRef = ref(db, `Vendors/${business}/Orders/${newStatus}/${orderId}`);
      await update(newRef, order);
      
      // Update customer's order status
      if (order && order.customerId) {
        const customerOrderRef = ref(db, `Users/${order.customerId}/Orders/${orderId}`);
        await update(customerOrderRef, { status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          New Orders ({newOrders.length})
        </h2>
      </div>

      {newOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium">No new orders at the moment</h3>
          <p className="text-sm text-gray-400 mt-1">New orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {newOrders.map((order) => {
            const itemCount = Object.keys(order.items || {}).length;
            const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
              return sum + (item.noOfItems || item.quantity || 1);
            }, 0);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer ${
                    expandedOrder === order.id ? 'bg-amber-50' : ''
                  }`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getTimeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 flex items-center justify-end">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      {order.total?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      New Order
                    </p>
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
                      <div className="px-4 pb-4 space-y-4">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            Order Summary
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Items</span>
                              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalItems} units)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Payment</span>
                              <div className="flex items-center">
                                <CreditCard className="h-3 w-3 mr-1" />
                                <span className="capitalize">{order.paymentMethod || 'Unknown'}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Total</span>
                              <span className="font-medium flex items-center">
                                <IndianRupee className="h-3 w-3 mr-1" />
                                {order.total?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Customer Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start">
                              <MapPin className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="break-words">{order.shippingAddress || 'No address provided'}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span>{order.phoneNumber || 'No phone provided'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Items ({itemCount})</h4>
                          <div className="space-y-3">
                            {Object.entries(order.items || {}).map(([key, item]) => {
                              const quantity = item.noOfItems || item.quantity || 1;
                              return (
                                <div key={key} className="flex items-start">
                                  <div className="flex-shrink-0 h-14 w-14 rounded-md overflow-hidden border border-gray-200 mr-3">
                                    <img
                                      src={item.image || 'https://via.placeholder.com/150'}
                                      alt={item.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName || 'Unnamed Product'}</p>
                                    <p className="text-xs text-gray-500">
                                      {item.category || 'General'} • {item.quantity} {item.unit || 'unit'}
                                    </p>
                                    {item.variantDetails && (
                                      <p className="text-xs text-gray-400 truncate">{item.variantDetails}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium flex items-center justify-end">
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

                        {/* Status Actions */}
                        <div className="pt-2">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Process Order</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Accepted Orders')}
                              className="py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Cancelled Orders')}
                              className="py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorNewOrders;