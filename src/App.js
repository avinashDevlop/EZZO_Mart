import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
// Layouts for different user roles
import MartLayout from "./Layouts/MartLayout";      // Customer (shop) layout
// import VendorLayout from "./Layouts/VendorLayout"; 

// Mart pages
import Home from "./pages/Mart/Home";
// import Products from "./Pages/Products";
// import Cart from "./Pages/Cart";

// Vendor pages
// import VendorDashboard from "./Pages/VendorDashboard";
// import VendorOrders from "./Pages/VendorOrders";
// import VendorProducts from "./Pages/VendorProducts";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes using MartLayout with MartHeader */}
        <Route element={<MartLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Routes using VendorLayout with VendorHeader */}
        {/* <Route element={<VendorLayout />}>
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
        </Route> */}
      </Routes>
    </Router>
  );
}

export default App;
