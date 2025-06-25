import React, { useState, useEffect } from 'react';
import { 
  Truck,
  IndianRupee,
  Package,
  User,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  Loader2,
  Check,
  X,
  Clock,
  Mail,
  ClipboardCheck
} from 'lucide-react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

const VendorOutForDelivery = () => {
  const [outForDeliveryOrders, setOutForDeliveryOrders] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showConfirmation, setShowConfirmation] = useState(null);
  const business = localStorage.getItem("vendorBusiness");

  useEffect(() => {
    if (!business) return;

    const db = getDatabase();
    const outForDeliveryRef = ref(db, `Vendors/${business}/Orders/Out for Delivery`);

    setLoading(true);
    const unsubscribe = onValue(outForDeliveryRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
          outForDeliveryAt: value.outForDeliveryAt ? new Date(value.outForDeliveryAt) : new Date()
        })).sort((a, b) => b.outForDeliveryAt - a.outForDeliveryAt);
        
        setOutForDeliveryOrders(ordersArray);
        
        // Fetch customer details for all orders
        ordersArray.forEach(order => {
          if (order.customerId && !customerDetails[order.customerId]) {
            const customerRef = ref(db, `Users/${order.customerId}`);
            onValue(customerRef, (customerSnapshot) => {
              const customerData = customerSnapshot.val();
              setCustomerDetails(prev => ({
                ...prev,
                [order.customerId]: customerData
              }));
            });
          }
        });
      } else {
        setOutForDeliveryOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [business, customerDetails]);

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!business) return;

    setProcessingOrder(orderId);
    const db = getDatabase();
    const order = outForDeliveryOrders.find(o => o.id === orderId);
    
    if (!order) {
      console.error("Order not found");
      setProcessingOrder(null);
      return;
    }

    try {
      // Create the updated order object with new status
      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: Date.now(),
        ...(newStatus === 'Delivered' && { deliveredAt: Date.now() })
      };

      // Create updates object for atomic updates
      const updates = {};
      
      // Remove from Out for Delivery
      updates[`Vendors/${business}/Orders/Out for Delivery/${orderId}`] = null;
      
      // Add to the new status category
      updates[`Vendors/${business}/Orders/${newStatus}/${orderId}`] = updatedOrder;
      
      // Update customer's order status if customerId exists
      if (order.customerId) {
        updates[`Users/${order.customerId}/Orders/${orderId}/status`] = newStatus;
        updates[`Users/${order.customerId}/Orders/${orderId}/updatedAt`] = Date.now();
      }

      // Perform all updates atomically
      await update(ref(db), updates);

      // Show success notification
      showNotification(
        `Order ${orderId.slice(-6).toUpperCase()} marked as ${newStatus}`,
        'success'
      );
      
      // Close the expanded view if open
      setExpandedOrder(null);
      setShowConfirmation(null);
      
    } catch (error) {
      console.error("Error updating order status: ", error);
      showNotification('Failed to update order status', 'error');
    } finally {
      setProcessingOrder(null);
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

  const getCustomerInfo = (order) => {
    if (!order.customerId) return null;
    
    const customer = customerDetails[order.customerId] || {};
    const address = customer.address || order.shippingAddress || 'No address provided';
    const phone = customer.phone || order.phoneNumber || 'No phone provided';
    const email = customer.email || 'No email provided';
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Unknown Customer';
    
    return { address, phone, email, name };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="pb-4 relative">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-md flex items-center ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Truck className="h-5 w-5 text-blue-500 mr-2" />
          Out for Delivery ({outForDeliveryOrders.length})
        </h2>
      </div>

      {outForDeliveryOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium">No orders out for delivery</h3>
          <p className="text-sm text-gray-400 mt-1">Orders marked as out for delivery will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {outForDeliveryOrders.map((order) => {
            const itemCount = Object.keys(order.items || {}).length;
            const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
              return sum + (item.noOfItems || item.quantity || 1);
            }, 0);
            const customerInfo = getCustomerInfo(order);

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
                    expandedOrder === order.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Out for delivery {getTimeAgo(order.outForDeliveryAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 flex items-center justify-end">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      {order.total?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      On the way
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
                        {/* Delivery Information */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                            <Truck className="h-4 w-4 mr-2" />
                            Delivery Information
                          </h4>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span>Dispatched {getTimeAgo(order.outForDeliveryAt)}</span>
                            </div>
                            {order.deliveryPerson && (
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>Delivery person: {order.deliveryPerson}</span>
                              </div>
                            )}
                            {order.estimatedDelivery && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>Estimated delivery: {order.estimatedDelivery}</span>
                              </div>
                            )}
                          </div>
                        </div>

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
                        {customerInfo && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Customer Info
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start">
                                <MapPin className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="break-words">{customerInfo.address}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>{customerInfo.phone}</span>
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>{customerInfo.email}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>{customerInfo.name}</span>
                              </div>
                            </div>
                          </div>
                        )}

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
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Update Order Status</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {showConfirmation === order.id ? (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'Delivered Orders')}
                                  disabled={processingOrder === order.id}
                                  className={`py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center ${
                                    processingOrder === order.id ? 'opacity-70' : ''
                                  }`}
                                >
                                  {processingOrder === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                  )}
                                  Confirm Delivery
                                </button>
                                <button
                                  onClick={() => setShowConfirmation(null)}
                                  disabled={processingOrder === order.id}
                                  className={`py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors flex items-center justify-center ${
                                    processingOrder === order.id ? 'opacity-70' : ''
                                  }`}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setShowConfirmation(order.id)}
                                disabled={processingOrder === order.id}
                                className={`py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center justify-center col-span-2 ${
                                  processingOrder === order.id ? 'opacity-70' : ''
                                }`}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </button>
                            )}
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

export default VendorOutForDelivery;