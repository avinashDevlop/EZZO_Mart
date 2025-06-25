import React, { useState, useEffect, useRef } from 'react';
import { 
  XCircle,
  IndianRupee,
  Package,
  User,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  Loader2,
  Mail,
  ChevronDown,
  ChevronUp,
  Printer,
  Save,
  AlertCircle
} from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// PDF Document Component
const OrderPDF = ({ order, customerInfo }) => {
  const itemCount = Object.keys(order.items || {}).length;
  const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
    return sum + (item.noOfItems || item.quantity || 1);
  }, 0);

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 12,
    },
    header: {
      marginBottom: 20,
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#dc2626',
    },
    subtitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 5,
    },
    section: {
      marginBottom: 15,
      padding: 10,
      backgroundColor: '#f3f4f6',
      borderRadius: 5,
    },
    cancellationSection: {
      backgroundColor: '#fee2e2',
      borderColor: '#fecaca',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingBottom: 8,
      borderBottom: '1px solid #e5e7eb',
    },
    label: {
      fontWeight: 'bold',
      color: '#4b5563',
    },
    value: {
      color: '#1f2937',
    },
    cancelledBadge: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '2px 6px',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 'bold',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <View style={[styles.row, { marginBottom: 10 }]}>
            <Text>Status:</Text>
            <View style={styles.cancelledBadge}>
              <Text>CANCELLED</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Order placed:</Text>
            <Text style={styles.value}>{order.createdAt.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cancelled at:</Text>
            <Text style={styles.value}>{order.cancelledAt.toLocaleString()}</Text>
          </View>
          {order.cancelledBy && (
            <View style={styles.row}>
              <Text style={styles.label}>Cancelled by:</Text>
              <Text style={styles.value}>{order.cancelledBy}</Text>
            </View>
          )}
        </View>

        {/* Cancellation Details */}
        <View style={[styles.section, styles.cancellationSection]}>
          <Text style={styles.subtitle}>Cancellation Details</Text>
          {order.cancellationReason && (
            <View>
              <Text style={[styles.label, { marginBottom: 5 }]}>Reason:</Text>
              <Text>{order.cancellationReason}</Text>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Items:</Text>
            <Text style={styles.value}>{itemCount} {itemCount === 1 ? 'item' : 'items'} ({totalItems} units)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{order.paymentMethod || 'Unknown'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>₹{order.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        {/* Customer Info */}
        {customerInfo && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Customer Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{customerInfo.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{customerInfo.address}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{customerInfo.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{customerInfo.email}</Text>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={{ marginTop: 15 }}>
          <Text style={styles.subtitle}>Order Items ({itemCount})</Text>
          {Object.entries(order.items || {}).map(([key, item]) => {
            const quantity = item.noOfItems || item.quantity || 1;
            return (
              <View key={key} style={styles.itemRow}>
                <View style={{ flex: 2 }}>
                  <Text style={{ fontWeight: 'bold' }}>{item.productName || 'Unnamed Product'}</Text>
                  <Text style={{ fontSize: 10, color: '#6b7280' }}>
                    {item.category || 'General'} • {item.quantity} {item.unit || 'unit'}
                  </Text>
                  {item.variantDetails && (
                    <Text style={{ fontSize: 10, color: '#9ca3af' }}>{item.variantDetails}</Text>
                  )}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text>₹{(item.price * quantity).toFixed(2)}</Text>
                  <Text style={{ fontSize: 10, color: '#6b7280' }}>Qty: {quantity}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 20, fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

const VendorCancelledOrders = () => {
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const business = localStorage.getItem("vendorBusiness");
  const printRef = useRef({});

  useEffect(() => {
    if (!business) return;

    const db = getDatabase();
    const cancelledOrdersRef = ref(db, `Vendors/${business}/Orders/Cancelled Orders`);

    setLoading(true);
    const unsubscribe = onValue(cancelledOrdersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
          cancelledAt: value.cancelledAt ? new Date(value.cancelledAt) : new Date()
        })).sort((a, b) => b.cancelledAt - a.cancelledAt);
        
        setCancelledOrders(ordersArray);
        
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
        setCancelledOrders([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [business, customerDetails]);

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

  const printOrder = (orderId) => {
    const content = printRef.current[orderId];
    if (!content) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Order Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { font-size: 18px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .section { margin-bottom: 20px; }
            .cancelled-badge { color: #dc2626; background-color: #fee2e2; padding: 2px 6px; border-radius: 9999px; font-size: 12px; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          Cancelled Orders ({cancelledOrders.length})
        </h2>
      </div>

      {cancelledOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium">No cancelled orders</h3>
          <p className="text-sm text-gray-400 mt-1">Cancelled orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cancelledOrders.map((order) => {
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
                    expandedOrder === order.id ? 'bg-red-50' : ''
                  }`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 text-red-800 flex items-center justify-center">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Cancelled {getTimeAgo(order.cancelledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 flex items-center justify-end">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {order.total?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        Cancelled
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
                      <div 
                        ref={el => printRef.current[order.id] = el}
                        className="px-4 pb-4 space-y-4"
                      >
                        {/* Cancellation Details */}
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                          <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Cancellation Details
                          </h4>
                          <div className="space-y-2 text-sm text-red-800">
                            <div className="flex justify-between">
                              <span>Order placed:</span>
                              <span>{order.createdAt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cancelled at:</span>
                              <span>{order.cancelledAt.toLocaleString()}</span>
                            </div>
                            {order.cancelledBy && (
                              <div className="flex justify-between">
                                <span>Cancelled by:</span>
                                <span className="capitalize">{order.cancelledBy}</span>
                              </div>
                            )}
                            {order.cancellationReason && (
                              <div>
                                <div className="font-medium">Reason:</div>
                                <p className="mt-1">{order.cancellationReason}</p>
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

                        {/* Actions */}
                        <div className="pt-2 flex space-x-2">
                          <button
                            onClick={() => printOrder(order.id)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors flex items-center justify-center"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </button>
                          <PDFDownloadLink 
                            document={<OrderPDF order={order} customerInfo={customerInfo} />}
                            fileName={`cancelled_order_${order.id}.pdf`}
                            className="flex-1"
                          >
                            {({ loading }) => (
                              <button
                                className="w-full py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors flex items-center justify-center"
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Preparing PDF...' : 'Save as PDF'}
                              </button>
                            )}
                          </PDFDownloadLink>
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

export default VendorCancelledOrders;