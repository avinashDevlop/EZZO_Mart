import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  Headphones,
  BarChart3,
  Eye,
  Plus,
  ShoppingBag,
  CheckCircle,
  Truck,
  Package2,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VendorSideNav = ({ isOpen }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const navStructure = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/vendor/dashboard',
      subItems: [
        { label: 'Analytics', path: '/vendor/dashboard/analytics', icon: BarChart3 },
        { label: 'Sales Overview', path: '/vendor/dashboard/sales', icon: Eye }
      ]
    },
    {
      key: 'products',
      label: 'Products',
      icon: Package,
      subItems: [
        { label: 'Add Product', path: '/vendor/products/add', icon: Plus },
        { label: 'View Products', path: '/vendor/products/view', icon: Eye },
        // { label: 'Manage Categories', path: '/vendor/products/categories', icon: FolderOpen },
        // { label: 'Stock', path: '/vendor/products/stock', icon: Archive }
      ]
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      subItems: [
        { label: 'New Orders', path: '/vendor/orders/new', icon: ShoppingBag },
        { label: 'Accepted Orders', path: '/vendor/orders/accepted', icon: CheckCircle },
        { label: 'Out For Delivery', path: '/vendor/orders/delivery', icon: Truck },
        { label: 'Delivered Orders', path: '/vendor/orders/delivered', icon: Package2 },
        { label: 'Cancelled Orders', path: '/vendor/orders/cancelled', icon: X }
      ]
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: IndianRupee,
      subItems: [
        { label: 'Revenue Overview', path: '/vendor/finance/revenue', icon: BarChart3 },
        { label: 'Payment Settings', path: '/vendor/finance/payments', icon: IndianRupee }
      ]
    },
    {
      key: 'support',
      label: 'Support',
      icon: Headphones,
      subItems: [
        { label: 'View Tickets', path: '/vendor/support/tickets', icon: Eye },
        { label: 'FAQ Management', path: '/vendor/support/faq', icon: Headphones }
      ]
    }
  ];

  const renderNavItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections[item.key];

    if (!hasSubItems && item.path) {
      return (
        <li key={item.key}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-orange-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-50 transition-all duration-200 rounded-r-lg mx-1 ${
                isActive ? 'bg-gradient-to-r from-orange-200 to-yellow-100 font-medium border-l-3 border-orange-500 shadow-sm' : ''
              }`
            }
            aria-label={item.label}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
          </NavLink>
        </li>
      );
    }

    return (
      <li key={item.key}>
        <div
          className={`flex items-center px-4 py-3 text-orange-800 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-50 transition-all duration-200 cursor-pointer rounded-r-lg mx-1 ${
            isExpanded ? 'bg-gradient-to-r from-orange-150 to-yellow-75' : ''
          }`}
          onClick={() => isOpen && toggleSection(item.key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              isOpen && toggleSection(item.key);
            }
          }}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {isOpen && (
            <>
              <span className="ml-3 text-sm font-medium flex-1 truncate">{item.label}</span>
              {hasSubItems && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {isOpen && isExpanded && hasSubItems && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden ml-1"
            >
              {item.subItems.map((subItem, subIndex) => (
                <li key={subIndex}>
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center pl-8 pr-3 py-2 text-orange-700 text-sm hover:bg-gradient-to-r hover:from-white hover:to-orange-50 transition-all duration-200 rounded-r-lg ${
                        isActive ? 'bg-gradient-to-r from-white to-orange-100 font-medium border-l-2 border-orange-400 text-orange-900' : ''
                      }`
                    }
                    aria-label={subItem.label}
                  >
                    <subItem.icon className="w-4 h-4 flex-shrink-0 mr-2" />
                    <span className="truncate">{subItem.label}</span>
                  </NavLink>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <motion.nav
      initial={{ width: isOpen ? 220 : 50 }}
      animate={{ width: isOpen ? 220 : 50 }}
      transition={{ type: 'spring', stiffness: 120, damping: 25 }}
      className={`bg-gradient-to-b from-yellow-50 via-orange-50 to-yellow-100 h-full shadow-lg flex flex-col border-r border-orange-200 ${
        isOpen ? 'w-[220px] sm:w-[240px] md:w-[270px]' : 'w-[50px] sm:w-[55px]'
      }`}
      role="navigation"
      aria-label="Vendor Sidebar Navigation"
    >
      {/* Navigation Links */}
      <ul className="flex-1 py-3 space-y-1">
        {navStructure.map(renderNavItem)}
      </ul>

      {/* Compact Footer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3 text-center border-t border-orange-200 bg-gradient-to-r from-yellow-50 to-orange-50"
        >
          <p className="font-medium text-orange-800 text-sm">EZZO</p>
          <p className="text-orange-500 text-sm">v1.0</p>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default VendorSideNav;