import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
  Settings,
  Shield,
} from "lucide-react";

const VendorHeader = ({
  onToggleSidebar,
  onLogout,
  vendor,
  vendorData,
  isSidebarOpen,
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [vendorBusiness, setVendorBusiness] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  useEffect(() => {
    const business = localStorage.getItem("vendorBusiness");
    const email = localStorage.getItem("vendorEmail");
    setVendorBusiness(business || "Unknown Business");
    setVendorEmail(email || "noemail@example.com");
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("vendorBusiness");
    localStorage.removeItem("vendorEmail");
    onLogout?.(); // Call the provided logout function if it exists
    navigate("/vendor-login"); // Redirect to home page
  };

  // Mock data for demo
  const mockVendorData = vendorData || {
    businessName: vendorBusiness,
    email: vendorEmail,
    avatar: null,
    notifications: 3,
    isVerified: true,
    // tier: "Premium",
  };

  const notifications = [
    { id: 1, text: "New order received", time: "2 min ago", unread: true },
    { id: 2, text: "Payment processed", time: "1 hour ago", unread: true },
    {
      id: 3,
      text: "Inventory low warning",
      time: "3 hours ago",
      unread: false,
    },
  ];

  return (
    <header className="relative bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 text-white shadow-2xl">
      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="group p-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 
                     focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200
                     border border-white/20 hover:border-white/30"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Enhanced Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col leading-none">
              <div className="flex items-center space-x-2">
                <span
                  className="text-2xl font-black tracking-tight bg-gradient-to-r 
                               from-white to-amber-100 bg-clip-text text-transparent 
                               filter drop-shadow-lg"
                >
                  EZZO
                </span>
                <span className="text-lg font-bold text-white self-end">
                  Mart
                </span>
              </div>
              <span className="text-xs font-medium text-orange-100 tracking-wider">
                into sustainability
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 
                         rounded-xl text-white placeholder-white/60 focus:outline-none 
                         focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 
                       focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200
                       border border-white/20 hover:border-white/30"
            >
              <Bell className="w-5 h-5" />
              {mockVendorData.notifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs 
                               rounded-full flex items-center justify-center font-bold animate-pulse"
                >
                  {mockVendorData.notifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl 
                            border border-gray-200 z-50 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                  <h3 className="font-bold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 transition-colors
                                   ${notification.unread ? "bg-blue-50" : ""}`}
                    >
                      <p className="text-sm text-gray-800">
                        {notification.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-gray-50 text-center">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm 
                       hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 
                       transition-all duration-200 border border-white/20 hover:border-white/30"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-white to-orange-100 
                                rounded-full flex items-center justify-center shadow-lg"
                  >
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  {mockVendorData.isVerified && (
                    <Shield
                      className="absolute -bottom-1 -right-1 w-4 h-4 text-green-400 
                                    bg-white rounded-full p-0.5"
                    />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-semibold">
                      {mockVendorData.businessName}
                    </span>
                    {/* <span
                      className="text-xs bg-white text-orange-600 px-1.5 py-0.5 
                                   rounded-md font-bold shadow-sm"
                    >
                      {mockVendorData.tier}
                    </span> */}
                  </div>
                  <p className="text-xs text-orange-100">
                    {mockVendorData.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl 
                            border border-gray-200 z-50 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 
                                  rounded-full flex items-center justify-center shadow-lg"
                    >
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {mockVendorData.businessName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mockVendorData.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 
                                   transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Profile Settings
                    </span>
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 
                                   transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      Account Settings
                    </span>
                  </button>
                </div>
                <div className="p-2 border-t">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 
                             transition-colors flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default VendorHeader;