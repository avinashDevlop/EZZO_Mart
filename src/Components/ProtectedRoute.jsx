// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase';

// General protected route for authenticated users
export const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children ? children : <Outlet />;
};

// Admin-specific protected route
export const AdminProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  
  // Add additional admin verification here if needed
  // For example: if (!user.email.endsWith('@admin.com')) return <Navigate to="/" replace />;
  
  return children ? children : <Outlet />;
};

// Vendor-specific protected route
export const VendorProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/vendor-login" replace />;
  }
  
  // Add additional vendor verification here if needed
  
  return children ? children : <Outlet />;
};