import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
// Layouts for different user roles
import MartLayout from "./Layouts/MartLayout"; 
import VendorLayout from "./Layouts/VendorLayout"; 
import AdminLayout from "./Layouts/AdminLayout";

// Mart pages
import Home from "./pages/Mart/Home";
import MartLogin from "./pages/Mart/MartLogin";
import ProductCategorie from "./pages/Mart/Products/ProductCategorie";
import ProductView from "./pages/Mart/Products/ProductView";
import MartOrders from "./pages/Mart/Orders/MartOrders";

// Vendor pages
import VendorDashboard from "./pages/Vendor/VendorDashboard";
import AddProduct from "./pages/Vendor/Products/AddProducts";
import ViewProducts from "./pages/Vendor/Products/ViewProducts";
import VendorNewOrders from "./pages/Vendor/Orders/NewOrders";
import VendorAcceptedOrders from "./pages/Vendor/Orders/AcceptedOrders";
import VendorOutForDelivery from "./pages/Vendor/Orders/OutForDelivery";
import VendorDeliveredOrders from "./pages/Vendor/Orders/DeliveredOrders";
import VendorCancelledOrders from "./pages/Vendor/Orders/CanceledOrders";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";

// General pages
import VendorLogin from "./pages/Vendor/VendorLogin";
import AdminLogin from "./pages/Admin/AdminLogin";

// Protected routes
import { AdminProtectedRoute, VendorProtectedRoute } from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/mart-login" element={<MartLogin />} />

        {/* Mart protected routes */}
        <Route element={<MartLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products-categorie/:category" element={<ProductCategorie />} />
          <Route path="/vendor/:vendorId/products/:category/:productId" element={<ProductView />} />
          <Route path="/mart-orders" element={<MartOrders />} />
        </Route>

        {/* Vendor protected routes */}
        <Route element={<VendorProtectedRoute />}>
          <Route element={<VendorLayout />}>
            <Route path="/vendor" element={<VendorDashboard />} />
            {/* Products */}
            <Route path="/vendor/products/add" element={<AddProduct />} />
            <Route path="/vendor/products/view" element={<ViewProducts />} />
            {/* Orders */}
            <Route path="/vendor/orders/new" element={<VendorNewOrders />} />
            <Route path="/vendor/orders/accepted" element={<VendorAcceptedOrders />} />
            <Route path="/vendor/orders/delivery" element={<VendorOutForDelivery />} />
            <Route path="/vendor/orders/delivered" element={<VendorDeliveredOrders />} />
            <Route path="/vendor/orders/cancelled" element={<VendorCancelledOrders />} />
          </Route>
        </Route>

        {/* Admin protected routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;