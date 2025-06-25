import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  IndianRupee,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const userId = localStorage.getItem('customerId');

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const ordersRef = ref(db, `Users/${userId}/Orders`);

    setLoading(true);
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
          updatedAt: value.updatedAt ? new Date(value.updatedAt) : null
        })).sort((a, b) => b.createdAt - a.createdAt);

        setOrders(ordersArray);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusDetails = (status) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'bg-amber-100 text-amber-800',
          icon: <Clock className="h-4 w-4" />,
          progress: 25,
          displayName: 'Pending'
        };
      case 'Accepted Orders':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="h-4 w-4" />,
          progress: 50,
          displayName: 'Accepted'
        };
      case 'Out for Delivery':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Truck className="h-4 w-4" />,
          progress: 75,
          displayName: 'Out for Delivery'
        };
      case 'Delivered Orders':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <Package className="h-4 w-4" />,
          progress: 100,
          displayName: 'Delivered'
        };
      case 'Cancelled Orders':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-4 w-4" />,
          progress: 0,
          displayName: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="h-4 w-4" />,
          progress: 0,
          displayName: status || 'Unknown'
        };
    }
  };

  const OrderProgressBar = ({ status }) => {
    const { progress } = getStatusDetails(status);
    const steps = [
      { name: 'Pending', value: 25 },
      { name: 'Accepted', value: 50 },
      { name: 'Out for Delivery', value: 75 },
      { name: 'Delivered', value: 100 }
    ];

    return (
      <div className="mt-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {getStatusDetails(status).displayName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {steps.map((step) => (
              <div
                key={step.name}
                className={`flex flex-col items-center ${progress >= step.value ? 'text-blue-600 font-medium' : ''}`}
              >
                <div className={`w-3 h-3 rounded-full ${progress >= step.value ? 'bg-blue-600' : 'bg-gray-300'} mb-1`}></div>
                <span className="hidden sm:inline">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="pb-8 px-2 sm:px-4 mt-10 min-h-[100px]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage all your orders</p>
        </div>

        {/* Order Status Tabs */}
        <div className="mb-6">
          <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap flex-shrink-0 ${activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Orders
              </button>
              {['Pending', 'Accepted Orders', 'Out for Delivery', 'Delivered Orders', 'Cancelled Orders'].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap flex-shrink-0 ${activeTab === status
                      ? `${getStatusDetails(status).color.replace('100', '600').replace('800', '100')} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {getStatusDetails(status).displayName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No orders found</h3>
            <p className="text-gray-400 mt-2">You don't have any {activeTab === 'all' ? '' : getStatusDetails(activeTab).displayName.toLowerCase()} orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const itemCount = Object.keys(order.items || {}).length;
              const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
                return sum + (item.quantity || 1);
              }, 0);
              const statusDetails = getStatusDetails(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div
                    className={`p-4 sm:p-5 flex justify-between items-center cursor-pointer ${expandedOrder === order.id ? 'bg-gray-50' : ''
                      }`}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full ${statusDetails.color} flex items-center justify-center`}>
                        {statusDetails.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {order.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 flex items-center justify-end">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {order.total?.toFixed(2) || '0.00'}
                        </p>
                        <p className={`text-xs ${statusDetails.color} px-2 py-0.5 rounded-full`}>
                          {statusDetails.displayName}
                        </p>
                      </div>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
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
                        <div className="px-4 sm:px-5 pb-5 space-y-5">
                          {/* Order Tracking */}
                          {order.status !== 'Cancelled Orders' && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                                <Truck className="h-4 w-4 mr-2" />
                                Order Tracking
                              </h4>
                              <OrderProgressBar status={order.status} />
                            </div>
                          )}

                          {/* Order Summary */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <Package className="h-4 w-4 mr-2" />
                              Order Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Order ID</p>
                                <p className="font-medium">{order.id}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Order Date</p>
                                <p className="font-medium">
                                  {order.createdAt.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Items</p>
                                <p className="font-medium">{itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalItems} units)</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Payment</p>
                                <p className="font-medium capitalize flex items-center">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {order.paymentMethod || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-medium">{statusDetails.displayName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-medium flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {order.total?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Ordered Items ({itemCount})</h4>
                            <div className="space-y-4">
                              {Object.entries(order.items || {}).map(([key, item]) => (
                                <div key={key} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200 mr-3">
                                    <img
                                      src={item.image || 'https://via.placeholder.com/150'}
                                      alt={item.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {item.productName || 'Unnamed Product'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {item.category || 'General'} • {item.quantity || 1} {item.unit || 'unit'}
                                    </p>
                                    {item.variantDetails && (
                                      <p className="text-xs text-gray-400 mt-1">{item.variantDetails}</p>
                                    )}
                                    <p className="text-sm font-medium mt-2 flex items-center">
                                      <IndianRupee className="h-3 w-3 mr-0.5" />
                                      {(item.price * (item.quantity || 1)).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                  </div>
                                </div>
                              ))}
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
    </div>
  );
};

export default CustomerOrders;