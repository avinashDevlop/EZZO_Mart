import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle,
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
  Clock,
  Printer,
  Save
} from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF Document Component
const OrderPDFDocument = ({ order, customerInfo }) => {
  const itemCount = Object.keys(order.items || {}).length;
  const totalItems = Object.values(order.items || {}).reduce((sum, item) => {
    return sum + (item.noOfItems || item.quantity || 1);
  }, 0);

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.subHeader}>Delivered on: {order.deliveredAt.toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text>Name: {customerInfo.name}</Text>
          <Text>Email: {customerInfo.email}</Text>
          <Text>Phone: {customerInfo.phone}</Text>
          <Text>Address: {customerInfo.address}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <Text>Items: {itemCount} ({totalItems} units)</Text>
          <Text>Payment Method: {order.paymentMethod || 'Unknown'}</Text>
          <Text>Total: ₹{order.total?.toFixed(2) || '0.00'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {Object.entries(order.items || {}).map(([key, item]) => {
            const quantity = item.noOfItems || item.quantity || 1;
            return (
              <View key={key} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.productName || 'Unnamed Product'}</Text>
                <Text style={styles.itemDetails}>
                  {item.category || 'General'} • {quantity} {item.unit || 'unit'}
                  {item.variantDetails && ` • ${item.variantDetails}`}
                </Text>
                <Text style={styles.itemPrice}>₹{(item.price * quantity).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your order!</Text>
        </View>
      </Page>
    </Document>
  );
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica'
  },
  section: {
    marginBottom: 20
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subHeader: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1 solid #eee',
    paddingBottom: 3
  },
  itemRow: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1 solid #f0f0f0'
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  itemDetails: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  itemPrice: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right'
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #eee',
    textAlign: 'center',
    fontSize: 10,
    color: '#999'
  }
});

const VendorDeliveredOrders = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  // const [pdfLoading, setPdfLoading] = useState(null);
  const business = localStorage.getItem("vendorBusiness");
  const printRef = useRef({});

  useEffect(() => {
    if (!business) return;

    const db = getDatabase();
    const deliveredOrdersRef = ref(db, `Vendors/${business}/Orders/Delivered Orders`);

    setLoading(true);
    const unsubscribe = onValue(deliveredOrdersRef, (snapshot) => {
      const ordersData = snapshot.val();
      if (ordersData) {
        const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt ? new Date(value.createdAt) : new Date(),
          deliveredAt: value.deliveredAt ? new Date(value.deliveredAt) : new Date()
        })).sort((a, b) => b.deliveredAt - a.deliveredAt);
        
        setDeliveredOrders(ordersArray);
        
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
        setDeliveredOrders([]);
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
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Delivered Orders ({deliveredOrders.length})
        </h2>
      </div>

      {deliveredOrders.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-500 font-medium">No delivered orders yet</h3>
          <p className="text-sm text-gray-400 mt-1">Completed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveredOrders.map((order) => {
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
                    expandedOrder === order.id ? 'bg-green-50' : ''
                  }`}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Delivered {getTimeAgo(order.deliveredAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 flex items-center justify-end">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {order.total?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Delivered
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
                        {/* Delivery Timeline */}
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Order Timeline
                          </h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <div className="flex justify-between">
                              <span>Order placed:</span>
                              <span>{order.createdAt.toLocaleString()}</span>
                            </div>
                            {order.acceptedAt && (
                              <div className="flex justify-between">
                                <span>Order accepted:</span>
                                <span>{new Date(order.acceptedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {order.outForDeliveryAt && (
                              <div className="flex justify-between">
                                <span>Dispatched:</span>
                                <span>{new Date(order.outForDeliveryAt).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium">
                              <span>Delivered:</span>
                              <span>{order.deliveredAt.toLocaleString()}</span>
                            </div>
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
                            document={<OrderPDFDocument order={order} customerInfo={customerInfo} />}
                            fileName={`order_${order.id.slice(-6).toUpperCase()}.pdf`}
                            className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors flex items-center justify-center"
                          >
                            {({ loading }) => (
                              <>
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Generating...' : 'Save as PDF'}
                              </>
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

export default VendorDeliveredOrders;